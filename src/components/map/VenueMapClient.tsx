"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { ListingStatus, VenueListing } from "@/types";
import type { Coordinates } from "@/utils/distance";

type Coordinate = [number, number];

type MarkerStyle = {
  label: string;
  stripe: string;
  glow: string;
};

type MappableVenueListing = VenueListing & {
  latitude: number;
  longitude: number;
};

type VenueMapClientProps = {
  venues: MappableVenueListing[];
  userLocation?: Coordinates | null;
};

type MapBoundsControllerProps = {
  venues: MappableVenueListing[];
  userLocation?: Coordinates | null;
};

const SAN_DIEGO_CENTER: Coordinate = [32.7157, -117.1611];
const DEFAULT_ZOOM = 10;
const pendingStatus = `ai_${"scouted"}` as ListingStatus;

const markerStyles = {
  verified: {
    label: "Verified Karaoke",
    stripe: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.75)",
  },
  claimed: {
    label: "Recently Updated",
    stripe: "#f472b6",
    glow: "rgba(244, 114, 182, 0.7)",
  },
  [pendingStatus]: {
    label: "On the Radar",
    stripe: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.65)",
  },
} as Record<ListingStatus, MarkerStyle>;

function getShapeStyle(venue: VenueListing) {
  if (venue.venueType === "private_room") {
    return {
      className: "singhub-room-marker",
      width: 48,
      height: 48,
      anchor: 24,
      css: "border-radius: 13px;",
      title: "Private karaoke room",
    };
  }

  if (venue.venueType === "event_producer") {
    return {
      className: "singhub-event-marker",
      width: 50,
      height: 48,
      anchor: 24,
      css: "clip-path: polygon(50% 4%, 96% 88%, 4% 88%); padding-top: 4px;",
      title: "Karaoke event producer",
    };
  }

  return {
    className: "singhub-live-marker",
    width: 46,
    height: 46,
    anchor: 23,
    css: "border-radius: 9999px;",
    title: "Live karaoke venue",
  };
}

function getVenueIcon(venue: VenueListing) {
  const accessibleName = venue.venueName.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
  const statusStyle = markerStyles[venue.listingStatus];
  const shape = getShapeStyle(venue);

  return L.divIcon({
    className: shape.className,
    html: `
      <span
        style="
          align-items: center;
          background: radial-gradient(circle at 32% 24%, rgba(255,255,255,0.42), transparent 17px), linear-gradient(135deg, #111827, #334155 52%, #0f172a);
          border: 2px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.9), 0 0 28px ${statusStyle.glow};
          color: white;
          display: flex;
          height: ${shape.height}px;
          justify-content: center;
          line-height: 1;
          overflow: hidden;
          position: relative;
          width: ${shape.width}px;
          ${shape.css}
        "
        title="${shape.title} • ${statusStyle.label}"
      >
        <span style="position:absolute;left:7px;right:7px;bottom:5px;height:4px;border-radius:999px;background:${statusStyle.stripe};box-shadow:0 0 10px ${statusStyle.glow};"></span>
        <span class="sr-only">${accessibleName}</span>
        <img src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" aria-hidden="true" style="display:block;width:35px;height:39px;object-fit:contain;filter:drop-shadow(0 2px 5px rgba(0,0,0,.62));" />
      </span>
    `,
    iconAnchor: [shape.anchor, shape.anchor],
    popupAnchor: [0, -20],
  });
}

function getUserIcon() {
  return L.divIcon({
    className: "singhub-user-location-marker",
    html: `
      <span
        style="
          align-items: center;
          background: radial-gradient(circle at center, #6ee7b7, #059669);
          border: 3px solid rgba(255, 255, 255, 0.95);
          border-radius: 9999px;
          box-shadow: 0 0 0 5px rgba(6, 78, 59, 0.35), 0 0 30px rgba(110, 231, 183, 0.8);
          color: #022c22;
          display: flex;
          font-size: 18px;
          font-weight: 900;
          height: 34px;
          justify-content: center;
          line-height: 1;
          width: 34px;
        "
        title="Your location"
      ><span class="sr-only">Your location</span><span aria-hidden="true">●</span></span>
    `,
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function getStatusLabel(status: ListingStatus) {
  return markerStyles[status].label;
}

function getVenueTypeLabel(venue: VenueListing) {
  if (venue.venueType === "private_room") {
    return "Karaoke room";
  }

  if (venue.venueType === "event_producer") {
    return "Karaoke event";
  }

  return "Live karaoke";
}

function MapBoundsController({
  venues,
  userLocation,
}: MapBoundsControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) {
      map.setView(SAN_DIEGO_CENTER, DEFAULT_ZOOM);
      return;
    }

    const points: Coordinate[] = venues.map((venue) => [
      venue.latitude,
      venue.longitude,
    ]);
    points.push([userLocation.latitude, userLocation.longitude]);

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [42, 42],
      maxZoom: 13,
    });
  }, [map, userLocation, venues]);

  return null;
}

export default function VenueMapClient({
  venues,
  userLocation = null,
}: VenueMapClientProps) {
  const [mapTheme, setMapTheme] = useState<"night" | "street">("night");
  const center = userLocation
    ? ([userLocation.latitude, userLocation.longitude] as Coordinate)
    : SAN_DIEGO_CENTER;

  if (venues.length === 0 && !userLocation) {
    return (
      <div className="flex min-h-72 items-center justify-center bg-slate-950/70 p-6 text-center text-sm leading-6 text-slate-300">
        No venue listings have usable coordinates yet. The full listing grid is
        still available below.
      </div>
    );
  }

  return (
    <div className="relative h-[28rem] overflow-hidden bg-slate-950 md:h-[34rem]" data-discover-map-theme={mapTheme}>
      <style>{`
        [data-discover-map-theme="night"] .leaflet-tile-pane .leaflet-tile {
          filter: grayscale(.25) invert(.91) hue-rotate(190deg) saturate(.58) brightness(.78) contrast(1.1);
        }
      `}</style>
      <div className="absolute right-3 top-3 z-[1000] flex gap-1 rounded-xl border border-white/20 bg-slate-950/90 p-1 text-xs font-bold shadow-xl" role="group" aria-label="Map color scheme">
        <button type="button" aria-pressed={mapTheme === "night"} onClick={() => setMapTheme("night")} className={mapTheme === "night" ? "rounded-lg bg-fuchsia-500 px-3 py-2 text-white" : "rounded-lg px-3 py-2 text-slate-200"}>Night</button>
        <button type="button" aria-pressed={mapTheme === "street"} onClick={() => setMapTheme("street")} className={mapTheme === "street" ? "rounded-lg bg-fuchsia-500 px-3 py-2 text-white" : "rounded-lg px-3 py-2 text-slate-200"}>Street</button>
      </div>
      <MapContainer
        center={center}
        zoom={userLocation ? 12 : DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapBoundsController venues={venues} userLocation={userLocation} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={getUserIcon()}
            title="Your location"
            alt="Your location"
          >
            <Popup>
              <div className="space-y-1 text-slate-900">
                <p className="text-base font-black text-slate-950">
                  You are here
                </p>
                <p className="text-sm text-slate-700">
                  SingHUB is sorting venue cards by distance from this point.
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={getVenueIcon(venue)}
            title={venue.venueName}
            alt={venue.venueName}
          >
            <Popup>
              <div className="space-y-2 text-slate-900">
                <p className="text-base font-black text-slate-950">
                  {venue.venueName}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {venue.neighborhood}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {getVenueTypeLabel(venue)} • {getStatusLabel(venue.listingStatus)}
                </p>
                <div className="flex flex-col gap-1 pt-1 text-sm font-bold text-cyan-700">
                  <Link href={`/venues/${venue.slug}`}>View venue profile</Link>
                  <Link href="/claim-listing">Claim/update this listing</Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
