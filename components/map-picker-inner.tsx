'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Navigation, X, Loader2 } from 'lucide-react';
import {
  resolveLocation,
  POPULAR_NEIGHBORHOODS,
  parseGhanaPostAddress,
  checkDeliveryZoneByCoords,
} from '@/lib/delivery-zones';

const pickerIcon = L.divIcon({
  className: 'delivery-marker',
  html: `<div style="
    width: 38px;
    height: 38px;
    background: #16a34a;
    border: 3.5px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  "><span style="transform: rotate(45deg); font-size: 16px;">📍</span></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

interface SearchResult {
  label: string;
  sublabel?: string;
  coords: [number, number];
  badge?: string;
}

function MapClickHandler({ onSelect }: { onSelect: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapFlyController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      map.flyTo(target, Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 1,
      });
    }
  }, [target, map]);
  return null;
}

export default function MapPickerInner({
  position,
  onPositionChange,
  height = 360,
}: {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
  height?: number;
}) {
  const markerRef = React.useRef<L.Marker>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [flyTarget, setFlyTarget] = React.useState<[number, number] | null>(null);
  const [locating, setLocating] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Real-time location search
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    const results: SearchResult[] = [];

    // 1. GhanaPost GPS Address detection
    const ghanaPost = parseGhanaPostAddress(q);
    if (ghanaPost.valid && ghanaPost.coords) {
      results.push({
        label: q.toUpperCase(),
        sublabel: `GhanaPost Digital Address (${ghanaPost.region} Region)`,
        coords: ghanaPost.coords,
        badge: 'GhanaPost',
      });
    }

    // 2. Local Neighborhood dictionary matching
    const qLower = q.toLowerCase();
    const matchedHubs = POPULAR_NEIGHBORHOODS.filter(
      (h) =>
        h.name.toLowerCase().includes(qLower) ||
        h.city.toLowerCase().includes(qLower) ||
        (h.digitalAddress && h.digitalAddress.toLowerCase().includes(qLower))
    );

    for (const hub of matchedHubs.slice(0, 4)) {
      results.push({
        label: hub.name,
        sublabel: `${hub.city}${hub.digitalAddress ? ` • ${hub.digitalAddress}` : ''}`,
        coords: hub.coords,
        badge: hub.city,
      });
    }

    setSearchResults(results);
    setDropdownOpen(results.length > 0);

    // 3. Fallback online geocoding (OpenStreetMap Ghana) for arbitrary streets/landmarks
    if (results.length < 3 && q.length >= 3) {
      const timer = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              q
            )}&countrycodes=gh&limit=4`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const remote: SearchResult[] = data.map((item: any) => ({
              label: item.display_name.split(',')[0],
              sublabel: item.display_name.split(',').slice(1, 3).join(',').trim(),
              coords: [parseFloat(item.lat), parseFloat(item.lon)],
              badge: 'Map',
            }));

            setSearchResults((prev) => {
              const combined = [...prev];
              for (const r of remote) {
                if (!combined.some((c) => Math.abs(c.coords[0] - r.coords[0]) < 0.001)) {
                  combined.push(r);
                }
              }
              return combined.slice(0, 6);
            });
            setDropdownOpen(true);
          }
        } catch (err) {
          console.warn('Geocoding search error:', err);
        } finally {
          setSearching(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleSelectResult = (result: SearchResult) => {
    onPositionChange(result.coords);
    setFlyTarget(result.coords);
    setSearchQuery(result.label);
    setDropdownOpen(false);
  };

  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onPositionChange([lat, lng]);
        setFlyTarget([lat, lng]);
        setSearchQuery('Current Location');
      },
      () => {
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onPositionChange([latLng.lat, latLng.lng]);
        }
      },
    }),
    [onPositionChange]
  );

  const zoneCheck = checkDeliveryZoneByCoords(position[0], position[1]);

  return (
    <div
      style={{ height, width: '100%' }}
      className="relative overflow-hidden rounded-2xl border border-border"
    >
      {/* Floating In-Map Search Bar */}
      <div
        ref={searchContainerRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-3 right-3 top-3 z-[1000] pointer-events-auto"
      >
        <div className="relative flex items-center rounded-xl border border-border/80 bg-background/95 shadow-md backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/40">
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search neighborhood, GhanaPost (e.g. GA-183-9125), or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setDropdownOpen(true);
            }}
            className="w-full bg-transparent px-3 py-2 text-xs font-medium outline-none placeholder:text-muted-foreground"
          />

          {searching && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-primary shrink-0" />}

          {searchQuery && !searching && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setDropdownOpen(false);
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="mx-1 h-4 w-px bg-border shrink-0" />

          {/* Quick in-map locate me button */}
          <button
            type="button"
            title="Use current GPS location"
            onClick={handleLocateMe}
            disabled={locating}
            className="mr-1.5 flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
          >
            {locating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 fill-primary/20" />
            )}
            Locate
          </button>
        </div>

        {/* Dropdown Suggestions */}
        {dropdownOpen && searchResults.length > 0 && (
          <div className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 p-1 shadow-xl backdrop-blur-md">
            {searchResults.map((item, idx) => (
              <button
                key={`${item.label}-${idx}`}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <div className="truncate">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    {item.sublabel && (
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </div>
                {item.badge && (
                  <span className="ml-2 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
          icon={pickerIcon}
        >
          <Popup>
            <div className="text-xs">
              <strong className="text-primary font-bold">Delivery Location</strong>
              <p className="text-muted-foreground mt-0.5">
                {zoneCheck.inZone
                  ? `${zoneCheck.zone} Delivery Zone`
                  : 'Outside standard delivery zone'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Drag pin to adjust gate</p>
            </div>
          </Popup>
        </Marker>
        <MapClickHandler onSelect={onPositionChange} />
        <MapFlyController target={flyTarget} />
      </MapContainer>

      {/* Bottom guidance banner */}
      <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 z-[1000] flex items-center justify-between rounded-xl bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-md">
        <span>Drag the 📍 pin to your exact compound or gate</span>
        <span
          className={
            zoneCheck.inZone
              ? 'font-semibold text-emerald-600 dark:text-emerald-400'
              : 'font-semibold text-destructive'
          }
        >
          {zoneCheck.inZone ? `✓ ${zoneCheck.zone} Zone` : 'Outside Zone'}
        </span>
      </div>
    </div>
  );
}

