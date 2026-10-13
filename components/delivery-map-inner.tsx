'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const destinationIcon = L.divIcon({
  className: 'delivery-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: hsl(var(--primary));
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  "><span style="transform: rotate(45deg); font-size: 14px;">📍</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const riderIcon = L.divIcon({
  className: 'rider-marker',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: hsl(142 76% 36%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px hsl(142 76% 36% / 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  "><span style="font-size: 12px;">🛵</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

interface DeliveryMapProps {
  destination: [number, number];
  destinationLabel?: string;
  riderPosition?: [number, number];
  className?: string;
  height?: number;
  zoom?: number;
}

export default function DeliveryMapInner({
  destination,
  destinationLabel = 'Delivery Destination',
  riderPosition,
  className,
  height = 300,
  zoom = 14,
}: DeliveryMapProps) {
  return (
    <div className={className} style={{ height, width: '100%' }}>
      <MapContainer
        center={destination}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={destination} icon={destinationIcon}>
          <Popup>
            <strong>{destinationLabel}</strong>
          </Popup>
        </Marker>
        {riderPosition && (
          <Marker position={riderPosition} icon={riderIcon}>
            <Popup>
              <strong>Your location</strong>
            </Popup>
          </Marker>
        )}
        <Recenter center={destination} />
      </MapContainer>
    </div>
  );
}
