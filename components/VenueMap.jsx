"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default marker icon paths (broken in webpack/next bundlers)
const ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Hellenic Football Club, Pringle Rd, Milnerton, Cape Town
const VENUE_LAT = -33.8697;
const VENUE_LNG = 18.5044;

export default function VenueMap() {
  return (
    <MapContainer
      center={[VENUE_LAT, VENUE_LNG]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%", minHeight: "220px" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[VENUE_LAT, VENUE_LNG]} icon={ICON}>
        <Popup>
          <strong>5s Arena</strong><br />
          Hellenic Football Club<br />
          Pringle Rd, Milnerton, Cape Town
        </Popup>
      </Marker>
    </MapContainer>
  );
}
