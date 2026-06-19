"use client";

import { useEffect } from "react";
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
  glow: string;
  background: string;
};

type VenueKind = "live" | "room";

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

const markerStyles: Record<ListingStatus, MarkerStyle> = {
  verified: {
    label: "Verified",
    glow: "rgba(103, 232, 249, 0.65)",
    background: "linear-gradient(135deg, #0891b2, #22d3ee)",
  },
  claimed: {
    label: "Claimed",
    glow: "rgba(232, 121, 249, 0.65)",
    background: "linear-gradient(135deg, #c026d3, #f472b6)",
  },
  ai_scouted: {
    label: "AI-Scouted",
    glow: "rgba(167, 139, 250, 0.55)",
    background: "linear-gradient(135deg, #6d28d9, #a78bfa)",
  },
};

function getVenueKind(venue: VenueListing): VenueKind {
  const searchText = [
    venue.venueName,
    venue.description,
    venue.karaokeDay,
    venue.hostName,
    ...venue.vibeTags,
  ]
    .join(" ")
    .toLowerCase();

  const roomSignals = [
    "private room",
    "private rooms",
    "karaoke room",
    "karaoke rooms",
    "ktv",
    "lounge",
    "bookable",
    "rooms",
    "hive",
    "melody",
    "spot ktv",
    "punch bowl",
    "round1",
    "jin music",
  ];

  return roomSignals.some((signal) => searchText.includes(signal)) ? "room" : "live";
}

function getMapCenter(venues: MappableVenueListing[]): Coordinate {
  if (venues.length === 0) {
    return SAN_DIEGO_CENTER;
  }

  const totals = venues.reduce(
    (accumulator, venue) => ({
      latitude: accumulator.latitude + venue.latitude,
      longitude: accumulator.longitude + venue.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return [totals.latitude / venues.length, totals.longitude / venues.length];
}

function getScheduleSummary(venue: VenueListing) {
  const schedule = `${venue.karaokeDay} • ${venue.startTime} to ${venue.endTime}`;

  return venue.hostName ? `${schedule} • Host: ${venue.hostName}` : schedule;
}

function getVenueIcon(venue: VenueListing) {
  const statusStyle = markerStyles[venue.listingStatus];
  const venueKind = getVenueKind(venue);

  if (venueKind === "room") {
    return L.divIcon({
      className: "singhub-room-marker",
      html: `
        <span
          aria-hidden="true"
          style="
            align-items: center;
            background: linear-gradient(135deg, #0891b2, #22d3ee);
            border: 2px solid rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.9), 0 0 28px rgba(34, 211, 238, 0.75);
            color: white;
            display: flex;
            flex-direction: column;
            font-size: 16px;
            font-weight: 900;
            height: 44px;
            justify-content: center;
            line-height: 0.9;
            position: relative;
            transform: rotate(4deg);
            width: 44px;
          "
          title="Karaoke room venue"
        ><span style="font-size: 17px; line-height: 1;">⌂</span><span style="font-size: 14px; line-height: 1;">♪</span></span>
      `,
      iconAnchor: [22, 22],
      popupAnchor: [0, -20],
    });
  }

  return L.divIcon({
    className: "singhub-microphone-marker",
    html: `
      <span
        aria-hidden="true"
        style="
          align-items: center;
          background: ${statusStyle.background};
          border: 2px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.9), 0 0 26px ${statusStyle.glow};
          color: white;
          display: flex;
          font-size: 20px;
          height: 42px;
          justify-content: center;
          line-height: 1;
          position: relative;
          transform: rotate(-8deg);
          width: 42px;
        "
        title="${statusStyle.label} karaoke venue"
      >🎤</span>
    `,
    iconAnchor: [21, 21],
    popupAnchor: [0, -18],
  });
}

function getUserIcon() {
  return L.divIcon({
    className: "singhub-user-location-marker",
    html: `
      <span
        aria-hidden="true"
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
      >●</span>
    `,
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function getStatusLabel(status: ListingStatus) {
  return markerStyles[status].label;
}

function getVenueKindLabel(venue: VenueListing) {
  return getVenueKind(venue) === "room" ? "Karaoke room" : "Live karaoke";
}

function MapBoundsController({
  venues,
  userLocation,
}: MapBoundsControllerProps) {
  const map = useMap();

  useEffect(() => {
    const points: Coordinate[] = venues.map((venue) => [
      venue.latitude,
      venue.longitude,
    ]);

    if (userLocation) {
      points.push([userLocation.latitude, userLocation.longitude]);
    }

    if (points.length === 0) {
      map.setView(SAN_DIEGO_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [42, 42],
      maxZoom: userLocation ? 13 : DEFAULT_ZOOM,
    });
  }, [map, userLocation, venues]);

  return null;
}

export default function VenueMapClient({
  venues,
  userLocation = null,
}: VenueMapClientProps) {
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude] as Coordinate
    : getMapCenter(venues);

  if (venues.length === 0 && !userLocation) {
    return (
      <div className="flex min-h-72 items-center justify-center bg-slate-950/70 p-6 text-center text-sm leading-6 text-slate-300">
        No venue listings have usable coordinates yet. The full listing grid is
        still available below.
      </div>
    );
  }

  return (
    <div className="relative h-[28rem] overflow-hidden bg-slate-950 md:h-[34rem]">
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
          >
            <Popup>
              <div className="space-y-2 text-slate-900">
                <p className="text-base font-black text-slate-950">
                  {venue.venueName}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {venue.neighborhood}
                </p>
                <p className="text-sm text-slate-700">{getScheduleSummary(venue)}</p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {getVenueKindLabel(venue)} • {getStatusLabel(venue.listingStatus)} listing
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
