"use client";

import { useEffect,useState } from "react";
import "./venueMap.css";
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

/** Official SH pin shared with the Tour Stop map. Listing status stays distinct. */
function getVenueIcon(venue:VenueListing) {
 const safeVenue=venue.venueName.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
 const status=markerStyles[venue.listingStatus];
 const kind=venue.venueType==="private_room"?"ROOM":venue.venueType==="event_producer"?"EVENT":"LIVE";
 const html='<span class="sh-discover-pin" title="'+safeVenue+' · '+kind+' · '+status.label+'">'+
   '<img src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" width="46" height="56" />'+
   '<span class="sh-discover-pin-status" style="background:'+status.stripe+';box-shadow:0 0 9px '+status.glow+';"></span>'+
   '<span class="sh-discover-pin-kind">'+kind+'</span>'+
   '<span class="sr-only">'+safeVenue+' · '+status.label+'</span></span>';
 return L.divIcon({className:"singhub-sh-marker",html,iconSize:[46,62],iconAnchor:[23,59],popupAnchor:[0,-52]});
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
  const [mapTheme,setMapTheme]=useState<"night"|"street">("night");
  const [tilesFailed,setTilesFailed]=useState(false);
  const [tileRefresh,setTileRefresh]=useState(0);
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
    <div className="sh-discover-map relative h-[28rem] overflow-hidden bg-slate-950 md:h-[34rem]" data-map-theme={mapTheme}>
      <MapContainer
        center={center}
        zoom={userLocation ? 12 : DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapBoundsController venues={venues} userLocation={userLocation} />

        <TileLayer
          key={tileRefresh}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{tileerror:()=>setTilesFailed(true)}}
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
      <div className="sh-discover-map-mode" role="group" aria-label="Map color scheme">
        <button type="button" aria-pressed={mapTheme==="night"} onClick={()=>setMapTheme("night")}>Night</button>
        <button type="button" aria-pressed={mapTheme==="street"} onClick={()=>setMapTheme("street")}>Street</button>
      </div>
      {tilesFailed&&<div className="sh-discover-map-error" role="status">
        Some map tiles didn't load. <button type="button" onClick={()=>{setTilesFailed(false);setTileRefresh(n=>n+1);}}>Retry</button>
      </div>}
    </div>
  );
}
