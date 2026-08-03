"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { VenueListing } from "@/types";
import {
  getVenueSignalData,
  isRadarVenue,
  isVerifiedKaraokeVenue,
} from "@/lib/venueSignals";

type MappableVenue = VenueListing & {
  latitude: number;
  longitude: number;
};

type Coordinate = [number, number];

const DEFAULT_CENTER: Coordinate = [32.7157, -117.1611];

function getSignal(venue: VenueListing) {
  const data = getVenueSignalData(venue);

  if (data.salute) {
    return { icon: "🫡", label: "SingHUB Salute", color: "#fcd34d", glow: "rgba(252,211,77,.75)" };
  }

  if (data.visit) {
    return { icon: "📍", label: "SingHUB Has Been Here", color: "#f0abfc", glow: "rgba(240,171,252,.72)" };
  }

  if (isVerifiedKaraokeVenue(venue)) {
    return { icon: "✅", label: "Verified Karaoke", color: "#67e8f9", glow: "rgba(103,232,249,.72)" };
  }

  if (isRadarVenue(venue)) {
    return { icon: "📡", label: "On the Radar", color: "#c4b5fd", glow: "rgba(196,181,253,.7)" };
  }

  return { icon: "✦", label: "Karaoke Place", color: "#fda4af", glow: "rgba(253,164,175,.66)" };
}

function getIcon(venue: VenueListing) {
  const signal = getSignal(venue);

  return L.divIcon({
    className: "singhub-place-marker",
    html: `
      <span style="
        align-items:center;
        background:linear-gradient(145deg,#0f172a,#020617);
        border:2px solid ${signal.color};
        border-radius:9999px;
        box-shadow:0 0 0 4px rgba(2,6,23,.88),0 0 24px ${signal.glow};
        display:flex;
        font-size:19px;
        height:42px;
        justify-content:center;
        width:42px;
      " title="${signal.label}">${signal.icon}</span>
    `,
    iconAnchor: [21, 21],
    popupAnchor: [0, -20],
  });
}

function BoundsController({ venues }: { venues: MappableVenue[] }) {
  const map = useMap();

  useEffect(() => {
    if (venues.length === 0) {
      map.setView(DEFAULT_CENTER, 10);
      return;
    }

    if (venues.length === 1) {
      map.setView([venues[0].latitude, venues[0].longitude], 14);
      return;
    }

    map.fitBounds(
      L.latLngBounds(venues.map((venue) => [venue.latitude, venue.longitude] as Coordinate)),
      { padding: [42, 42], maxZoom: 13 },
    );
  }, [map, venues]);

  return null;
}

function getCenter(venues: MappableVenue[]): Coordinate {
  if (venues.length === 0) return DEFAULT_CENTER;

  const total = venues.reduce(
    (result, venue) => ({
      latitude: result.latitude + venue.latitude,
      longitude: result.longitude + venue.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return [total.latitude / venues.length, total.longitude / venues.length];
}

export default function KaraokePlacesMapClient({ venues }: { venues: MappableVenue[] }) {
  if (venues.length === 0) {
    return (
      <div className="flex h-[28rem] items-center justify-center bg-slate-950/70 p-6 text-center text-sm text-slate-300">
        No mapped karaoke places match these filters.
      </div>
    );
  }

  return (
    <div className="h-[28rem] overflow-hidden bg-slate-950 md:h-[34rem]">
      <MapContainer center={getCenter(venues)} zoom={10} scrollWheelZoom={false} className="h-full w-full">
        <BoundsController venues={venues} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {venues.map((venue) => {
          const signal = getSignal(venue);
          return (
            <Marker
              key={venue.id}
              position={[venue.latitude, venue.longitude]}
              icon={getIcon(venue)}
            >
              <Popup>
                <div className="space-y-2 text-slate-900">
                  <p className="text-base font-black text-slate-950">{venue.venueName}</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {venue.neighborhood || venue.city}
                  </p>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    {signal.icon} {signal.label}
                  </p>
                  <p className="text-sm text-slate-700">
                    Open the profile for verified events, Singers Say, and what SingHUB knows about this place.
                  </p>
                  <Link className="text-sm font-black text-cyan-700" href={`/venues/${venue.slug}`}>
                    View venue profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
