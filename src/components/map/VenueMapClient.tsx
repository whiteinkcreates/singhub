"use client";

import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ListingStatus, VenueListing } from "@/types";

type Coordinate = [number, number];

type MarkerStyle = {
  label: string;
  glow: string;
  background: string;
};

type MappableVenueListing = VenueListing & {
  latitude: number;
  longitude: number;
};

type VenueMapClientProps = {
  venues: MappableVenueListing[];
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

function getVenueIcon(status: ListingStatus) {
  const style = markerStyles[status];

  return L.divIcon({
    className: "singhub-microphone-marker",
    html: `
      <span
        aria-hidden="true"
        style="
          align-items: center;
          background: ${style.background};
          border: 2px solid rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.9), 0 0 26px ${style.glow};
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
        title="${style.label} karaoke venue"
      >🎤</span>
    `,
    iconAnchor: [21, 21],
    popupAnchor: [0, -18],
  });
}

function getStatusLabel(status: ListingStatus) {
  return markerStyles[status].label;
}

export default function VenueMapClient({ venues }: VenueMapClientProps) {
  const center = getMapCenter(venues);

  if (venues.length === 0) {
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
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={getVenueIcon(venue.listingStatus)}
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
                  {getStatusLabel(venue.listingStatus)} listing
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
