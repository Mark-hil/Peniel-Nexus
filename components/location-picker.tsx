'use client';

import * as React from 'react';
import {
  MapPin,
  Navigation,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  checkDeliveryZone,
  resolveLocation,
  POPULAR_NEIGHBORHOODS,
  type NeighborhoodLocation,
} from '@/lib/delivery-zones';
import { MapPicker } from '@/components/map-picker';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LocationPickerProps {
  value: string; // Stored as "lat, lng" or GhanaPost code for DB
  onChange: (gpsValue: string, resolvedLabel?: string) => void;
  label?: string;
  onAddressSuggest?: (suggestedAddress: string) => void;
  className?: string;
}

export function LocationPicker({
  value,
  onChange,
  label = 'Delivery Location & Digital Address',
  onAddressSuggest,
  className,
}: LocationPickerProps) {
  const [displayInput, setDisplayInput] = React.useState('');
  const [locating, setLocating] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const isInternalRef = React.useRef(false);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = React.useState<{
    inZone: boolean;
    zone?: string;
    distanceKm?: number;
  }>({ inZone: false });

  // Selected city for quick select hubs (Kumasi default as requested)
  const [selectedCity, setSelectedCity] = React.useState<'Kumasi' | 'Accra' | 'Tema'>('Kumasi');

  // Map coordinates (lat, lng) - Default to Kumasi center
  const [mapCoords, setMapCoords] = React.useState<[number, number]>([6.6885, -1.6244]);

  // Synchronize incoming value with display input and zone
  React.useEffect(() => {
    if (isInternalRef.current) {
      isInternalRef.current = false;
      return;
    }

    if (!value) {
      setDisplayInput('');
      setActiveZone({ inZone: false });
      return;
    }

    const zoneInfo = checkDeliveryZone(value);
    setActiveZone(zoneInfo);

    if (zoneInfo.coords) {
      setMapCoords(zoneInfo.coords);
    }

    const resolved = resolveLocation(value);
    if (resolved && resolved.source !== 'coords') {
      setDisplayInput(resolved.label);
    } else if (zoneInfo.resolvedLabel) {
      setDisplayInput(zoneInfo.resolvedLabel);
    } else {
      setDisplayInput(value);
    }
  }, [value]);

  // Filter neighborhood suggestions based on input
  const suggestions = React.useMemo(() => {
    const q = displayInput.trim().toLowerCase();
    if (q.length < 2) return [];
    return POPULAR_NEIGHBORHOODS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        (h.digitalAddress && h.digitalAddress.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [displayInput]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle manual text changes
  const handleInputChange = (text: string) => {
    setDisplayInput(text);
    setSuggestionsOpen(text.trim().length >= 2);
    isInternalRef.current = true;

    if (!text.trim()) {
      onChange('');
      setActiveZone({ inZone: false });
      return;
    }

    const resolved = resolveLocation(text);
    if (resolved) {
      const coordsStr = `${resolved.coords[0].toFixed(5)}, ${resolved.coords[1].toFixed(5)}`;
      onChange(coordsStr, resolved.label);
      setMapCoords(resolved.coords);
      const zone = checkDeliveryZone(coordsStr);
      setActiveZone(zone);

      if (onAddressSuggest) {
        onAddressSuggest(resolved.label);
      }
    } else {
      // Check if it matches raw coordinates
      const parts = text.split(',').map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        onChange(text);
        setMapCoords([parts[0], parts[1]]);
        setActiveZone(checkDeliveryZone(text));
      } else {
        onChange(text);
        setActiveZone({ inZone: false });
      }
    }
  };

  // 1-Tap Geolocation ("Locate Me")
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coordsStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setMapCoords([lat, lng]);

        const zone = checkDeliveryZone(coordsStr);
        setActiveZone(zone);

        const labelText = zone.inZone
          ? `Current Location (${zone.zone} Zone)`
          : `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        isInternalRef.current = true;
        setDisplayInput(labelText);
        onChange(coordsStr, labelText);

        if (zone.inZone) {
          toast.success('Location Pinpointed!', {
            description: `We deliver directly to your spot in ${zone.zone}.`,
          });
        } else {
          toast.warning('Location outside standard zone', {
            description: `Nearest zone is ${zone.zone} (~${zone.distanceKm?.toFixed(0)}km).`,
          });
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err);
        toast.error('Could not retrieve current location. Please allow browser location access or pick on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick neighborhood chip select
  const handleSelectNeighborhood = (hub: NeighborhoodLocation) => {
    const coordsStr = `${hub.coords[0].toFixed(5)}, ${hub.coords[1].toFixed(5)}`;
    const labelText = `${hub.name}, ${hub.city}`;
    isInternalRef.current = true;
    setDisplayInput(labelText);
    setMapCoords(hub.coords);
    onChange(coordsStr, labelText);
    setSuggestionsOpen(false);

    if (onAddressSuggest) {
      onAddressSuggest(labelText);
    }

    const zone = checkDeliveryZone(coordsStr);
    setActiveZone(zone);
  };

  // Confirm map picker position
  const handleConfirmMapPicker = () => {
    const coordsStr = `${mapCoords[0].toFixed(5)}, ${mapCoords[1].toFixed(5)}`;
    const zone = checkDeliveryZone(coordsStr);
    setActiveZone(zone);

    const labelText = zone.inZone
      ? `Pinned in ${zone.zone} (${mapCoords[0].toFixed(4)}, ${mapCoords[1].toFixed(4)})`
      : `Pinned Location (${mapCoords[0].toFixed(4)}, ${mapCoords[1].toFixed(4)})`;

    isInternalRef.current = true;
    setDisplayInput(labelText);
    onChange(coordsStr, labelText);
    setMapOpen(false);

    toast.success('Map Pin Saved!', {
      description: zone.inZone ? `Located in ${zone.zone} delivery zone.` : 'Location saved.',
    });
  };

  const handleClear = () => {
    isInternalRef.current = true;
    setDisplayInput('');
    onChange('');
    setActiveZone({ inZone: false });
    setSuggestionsOpen(false);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{label}</Label>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={locating}
            className="h-7 rounded-lg px-2.5 text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
          >
            {locating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="mr-1 h-3 w-3 fill-primary/20" />
            )}
            Locate Me
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMapOpen(true)}
            className="h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <MapIcon className="mr-1 h-3 w-3" />
            Pick on Map
          </Button>
        </div>
      </div>

      {/* Main input with autocomplete container */}
      <div ref={inputContainerRef} className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <Input
          placeholder="Neighborhood, GhanaPost GPS (e.g. GA-183-9125), or landmark"
          value={displayInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (displayInput.trim().length >= 2) setSuggestionsOpen(true);
          }}
          className="pl-9 pr-8"
        />
        {displayInput && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Live Autocomplete Dropdown */}
        {suggestionsOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover/95 p-1 shadow-lg backdrop-blur-md">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Matching Delivery Locations
            </div>
            {suggestions.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => handleSelectNeighborhood(hub)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{hub.name}</span>
                    <span className="ml-1 text-muted-foreground">({hub.city})</span>
                  </div>
                </div>
                {hub.digitalAddress && (
                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                    {hub.digitalAddress}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick neighborhood chips with Kumasi default */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Quick Select Hubs ({selectedCity}):
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-0.5 border border-border/50">
            {(['Kumasi', 'Accra', 'Tema'] as const).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all',
                  selectedCity === city
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_NEIGHBORHOODS.filter((hub) => hub.city === selectedCity)
            .slice(0, 16)
            .map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => handleSelectNeighborhood(hub)}
                className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95"
              >
                {hub.name}
              </button>
            ))}
        </div>
      </div>

      {/* Zone status banner */}
      {displayInput.trim() && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium transition-all',
            activeZone.inZone
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          )}
        >
          {activeZone.inZone ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Delivers to <strong>{activeZone.zone}</strong> delivery zone. Riders are available.</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span>
                Outside delivery zone (nearest: {activeZone.zone || 'Accra'}{' '}
                {activeZone.distanceKm ? `~${activeZone.distanceKm.toFixed(0)}km away` : ''}). We deliver in Accra, Kumasi & Tema.
              </span>
            </>
          )}
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MapIcon className="h-4 w-4 text-primary" />
              Pin Exact Delivery Gate / House
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Drag or tap the map to place the pin on your exact gate or door.
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <MapPicker
              position={mapCoords}
              onPositionChange={(newPos) => setMapCoords(newPos)}
              height={380}
            />
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">
                {mapCoords[0].toFixed(4)}, {mapCoords[1].toFixed(4)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {checkDeliveryZone(`${mapCoords[0]}, ${mapCoords[1]}`).zone || 'Accra'} Zone
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setMapOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmMapPicker}>
                Confirm Location
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
