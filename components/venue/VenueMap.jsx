"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaDirections, FaExpand, FaCompress } from "react-icons/fa";

const VENUE = {
  name: "Hellenic Football Club",
  address: "Milnerton, Cape Town, 7441",
  lat: -33.8688,
  lng: 18.5228,
  googleMapsUrl:
    "https://maps.google.com/?q=Hellenic+Football+Club+Milnerton+Cape+Town",
  embedQuery: "Hellenic+Football+Club+Milnerton+Cape+Town",
};

/**
 * VenueMap — renders an embedded Google Map for Hellenic FC.
 * Falls back to iframe embed (no API key needed) when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is absent.
 * Admin controls (enabled/disabled) are checked server-side; this component is only rendered
 * when the Maps API is enabled in the Google API admin panel.
 */
export default function VenueMap({ className = "", height = 320 }) {
  const [expanded, setExpanded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapHeight = expanded ? 500 : height;

  // Build embed URL — uses API key if available, otherwise bare embed
  const embedSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${VENUE.embedQuery}&zoom=15`
    : `https://maps.google.com/maps?q=${VENUE.embedQuery}&z=15&output=embed`;

  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 ${className}`}>
      {/* Map header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-green-400" size={14} />
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">
            {VENUE.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
          aria-label={expanded ? "Collapse map" : "Expand map"}
        >
          {expanded ? <FaCompress size={12} /> : <FaExpand size={12} />}
        </button>
      </div>

      {/* Iframe embed */}
      <div style={{ height: mapHeight }} className="relative transition-all duration-300">
        <iframe
          title="Venue map — Hellenic Football Club, Milnerton"
          src={embedSrc}
          width="100%"
          height="100%"
          style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
        <p className="text-[11px] text-white/40">{VENUE.address}</p>
        <a
          href={VENUE.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-green-400 transition-all hover:bg-green-500/20"
        >
          <FaDirections size={11} />
          Directions
        </a>
      </div>
    </div>
  );
}
