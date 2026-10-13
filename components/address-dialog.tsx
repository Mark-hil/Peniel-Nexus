'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkDeliveryZone } from '@/lib/delivery-zones';
import { LocationPicker } from '@/components/location-picker';
import type { SavedAddress } from '@/types';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (addr: Omit<SavedAddress, 'id'>) => void;
  editing?: SavedAddress | null;
}

export function AddressDialog({ open, onOpenChange, onSave, editing }: AddressDialogProps) {
  const [label, setLabel] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [locationLabel, setLocationLabel] = React.useState('');
  const [gps, setGps] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setLabel(editing?.label ?? '');
      setAddress(editing?.address ?? '');
      setGps(editing?.gps ?? '');
      setLocationLabel(editing?.address ?? '');
      setError('');
    }
  }, [open, editing]);

  const handleSave = () => {
    if (!label.trim() || !gps.trim()) {
      setError('Please provide a label and select a delivery location.');
      return;
    }

    const zone = checkDeliveryZone(gps);
    if (!zone.inZone) {
      setError(
        `Sorry, we don't deliver to this location yet. Nearest zone is ${zone.zone || 'Kumasi'} (${zone.distanceKm?.toFixed(0) || '—'}km away). We currently serve Kumasi, Accra, and Tema.`,
      );
      return;
    }

    const finalAddress = address.trim()
      ? `${address.trim()} (${locationLabel || gps})`
      : (locationLabel || gps);

    onSave({ label: label.trim(), address: finalAddress, gps: gps.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {editing ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              placeholder="e.g. Home, Work, Mom's House"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="pt-1">
            <LocationPicker
              label="Delivery Location & Digital Address"
              value={gps}
              onChange={(newGps, labelText) => {
                setGps(newGps);
                if (labelText) {
                  setLocationLabel(labelText);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>House No. / Landmark Notes</Label>
              <span className="text-[11px] text-muted-foreground">Optional</span>
            </div>
            <Input
              placeholder="e.g. House No. 12, Behind Shell Station, Flat 2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Address'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
