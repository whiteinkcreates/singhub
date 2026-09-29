"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import { HOTEL_AT_MARK_SRC } from "@/lib/hotelAtMark";

type MappedHotelVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  distanceLabel: string;
  tier: "walkable" | "quick" | "standout";
};

type Props = {
  hotelName: string;
  hotelAddress: string;
  hotelLatitude: number;
  hotelLongitude: number;
  venues: MappedHotelVenue[];
};

function micSvg(size = 24) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" style="display:block">
      <g transform="rotate(-38 32 32)">
        <circle cx="25" cy="20" r="13" fill="white"/>
        <path d="M16 20h18M18 14c5 4 10 4 15 0M18 26c5-4 10-4 15 0" stroke="#083344" stroke-width="3.4" stroke-linecap="round" opacity=".58"/>
        <path d="M34 29l19 19" stroke="white" stroke-width="10" stroke-linecap="round"/>
      </g>
    </svg>
  `;
}

function venueIcon(tier: MappedHotelVenue["tier"]) {
  const ring = tier === "standout" ? "#a78bfa" : "#22d3ee";
  return L.divIcon({
    className: "singhub-hotel-venue-marker",
    html: `
      <span style="
        width:42px;height:42px;border-radius:999px;
        display:flex;align-items:center;justify-content:center;
        background:linear-gradient(145deg,#07111d,#0e2231);
        border:2px solid ${ring};
        box-shadow:0 0 0 4px rgba(2,6,23,.75),0 0 24px ${ring}99;
      ">${micSvg(24)}</span>
    `,
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
}

function hotelIcon() {
  return L.divIcon({
    className: "singhub-hotel-origin-marker",
    html: `
      <span style="
        width:66px;height:66px;border-radius:999px;
        display:flex;align-items:center;justify-content:center;
        background:rgba(2,6,23,.92);
        border:1px solid rgba(34,211,238,.7);
        box-shadow:0 0 0 5px rgba(2,6,23,.75),0 0 34px rgba(34,211,238,.62);
        overflow:hidden;
      ">
        <img src="${HOTEL_AT_MARK_SRC}" alt="" style="width:52px;height:52px;object-fit:contain;display:block" />
      </span>
    `,
    iconAnchor: [33, 33],
    popupAnchor: [0, -32],
  });
}

function Bounds({ hotelLatitude, hotelLongitude, venues }: Omit<Props, "hotelName" | "hotelAddress">) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      [hotelLatitude, hotelLongitude],
      ...venues.map((venue) => [venue.latitude, venue.longitude] as [number, number]),
    ];

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [38, 38],
      maxZoom: 14,
    });
  }, [hotelLatitude, hotelLongitude, map, venues]);

  return null;
}

export default function HotelGuideMapClient({
  hotelName,
  hotelAddress,
  hotelLatitude,
  hotelLongitude,
  venues,
}: Props) {
  return (
    <div className="h-[23rem] w-full overflow-hidden sm:h-[28rem]">
      <MapContainer
        center={[hotelLatitude, hotelLongitude]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <Bounds hotelLatitude={hotelLatitude} hotelLongitude={hotelLongitude} venues={venues} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <Marker position={[hotelLatitude, hotelLongitude]} icon={hotelIcon()}>
          <Popup>
            <div className="space-y-1 text-slate-900">
              <p className="font-black text-slate-950">{hotelName}</p>
              <p className="text-sm text-slate-700">{hotelAddress}</p>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">Your starting point</p>
            </div>
          </Popup>
        </Marker>

        {venues.map((venue) => (
          <Marker
            key={venue.slug}
            position={[venue.latitude, venue.longitude]}
            icon={venueIcon(venue.tier)}
          >
            <Popup>
              <div className="space-y-1 text-slate-900">
                <p className="font-black text-slate-950">{venue.name}</p>
                <p className="text-sm text-slate-700">{venue.neighborhood}</p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">{venue.distanceLabel}</p>
                <Link href={`/venues/${venue.slug}`} className="inline-block pt-1 text-sm font-black text-cyan-700">
                  View venue →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
