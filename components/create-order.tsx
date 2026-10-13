'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  MapPin,
  Phone,
  Clock,
  StickyNote,
  ShoppingCart,
  Wallet,
  Truck,
  Receipt,
  ArrowRight,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatGHS } from '@/lib/format';
import { popularItems } from '@/lib/constants';
import { useSavedAddresses } from '@/hooks/use-saved-addresses';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/components/auth-provider';
import { checkDeliveryZone } from '@/lib/delivery-zones';
import { LocationPicker } from '@/components/location-picker';
import { cn } from '@/lib/utils';
import type { SavedAddress } from '@/types';

import { env } from '@/lib/config';

interface OrderItem {
  id: string;
  name: string;
  budget: string;
  quantity: string;
  notes: string;
}

const SERVICE_FEE_RATE = env.serviceFeeRate;
const DELIVERY_FEE = env.deliveryFee;

export function CreateOrder() {
  const router = useRouter();
  const { user } = useAuth();
  const { addresses } = useSavedAddresses();
  const { createOrder } = useOrders();
  const [submitting, setSubmitting] = React.useState(false);
  const [items, setItems] = React.useState<OrderItem[]>([
    { id: '1', name: 'Tomatoes', budget: '20', quantity: '2 heaps', notes: 'Very ripe' },
    { id: '2', name: 'Onions', budget: '10', quantity: '1 heap', notes: '' },
    { id: '3', name: 'Pepper', budget: '5', quantity: '1 heap', notes: 'Red pepper' },
    { id: '4', name: 'Fish', budget: '50', quantity: '2 pieces', notes: 'Tilapia, fresh' },
  ]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>('');
  const [customerName, setCustomerName] = React.useState(user?.fullName || 'Akosua Mansa');
  const [address, setAddress] = React.useState('');
  const [locationLabel, setLocationLabel] = React.useState('');
  const [gps, setGps] = React.useState('');
  const [phone, setPhone] = React.useState(user?.phone || '+233 24 555 0142');
  const [deliveryTime, setDeliveryTime] = React.useState('Today, 2:00 PM – 4:00 PM');
  const [instructions, setInstructions] = React.useState('');
  const [zoneStatus, setZoneStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle');
  const [zoneMessage, setZoneMessage] = React.useState('');

  React.useEffect(() => {
    if (user?.fullName) setCustomerName(user.fullName);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  React.useEffect(() => {
    const selected = addresses.find((a) => a.id === selectedAddressId);
    if (selected) {
      setAddress(selected.address);
      setGps(selected.gps);
      setLocationLabel(selected.address);
    }
  }, [selectedAddressId, addresses]);

  const validateZone = React.useCallback((gpsValue: string) => {
    if (!gpsValue.trim()) {
      setZoneStatus('idle');
      setZoneMessage('');
      return;
    }
    const result = checkDeliveryZone(gpsValue);
    if (result.inZone) {
      setZoneStatus('valid');
      setZoneMessage(`Delivers to ${result.zone} zone`);
    } else {
      setZoneStatus('invalid');
      setZoneMessage(
        `Out of delivery zone. Nearest zone: ${result.zone} (${result.distanceKm?.toFixed(0)}km away). We serve Accra, Kumasi, and Tema.`,
      );
    }
  }, []);

  React.useEffect(() => {
    validateZone(gps);
  }, [gps, validateZone]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', budget: '', quantity: '', notes: '' },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const shoppingBudget = items.reduce((sum, i) => sum + (parseFloat(i.budget) || 0), 0);
  const serviceFee = shoppingBudget * SERVICE_FEE_RATE;
  const total = shoppingBudget + serviceFee + DELIVERY_FEE;

  const handleCheckout = async () => {
    if (items.length === 0 || items.some((i) => !i.name || !i.budget)) {
      toast.error('Please complete all items with a name and budget');
      return;
    }
    if (!gps.trim()) {
      toast.error('Please select a delivery location or digital address');
      return;
    }
    if (zoneStatus === 'invalid') {
      toast.error('Your delivery address is outside our service zone.');
      return;
    }

    const fullDeliveryAddress = address.trim()
      ? `${address.trim()} (${locationLabel || gps})`
      : (locationLabel || gps);

    setSubmitting(true);
    const orderId = await createOrder({
      items: items.map((i) => ({
        name: i.name,
        budget: parseFloat(i.budget) || 0,
        quantity: i.quantity || undefined,
        notes: i.notes || undefined,
      })),
      deliveryAddress: fullDeliveryAddress,
      gpsLocation: gps,
      preferredTime: deliveryTime,
      specialInstructions: instructions || undefined,
      paymentMethod: 'mtn_momo',
      shoppingBudget,
      serviceFee,
      deliveryFee: DELIVERY_FEE,
      total,
      customerName: customerName.trim() || undefined,
      customerPhone: phone.trim() || undefined,
    });
    setSubmitting(false);

    if (orderId) {
      router.push(`/payment?orderId=${orderId}`);
    } else {
      toast.error('Could not create order. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Create New Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add items to your shopping list and set a budget for each. Our shoppers will buy fresh from the market.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: shopping list + delivery details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shopping list */}
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Shopping List
              </CardTitle>
              <span className="text-sm text-muted-foreground">{items.length} items</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex items-center pt-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Item Name</Label>
                        <Input
                          placeholder="e.g. Tomatoes"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Budget (GHS)</Label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="20"
                            value={item.budget}
                            onChange={(e) => updateItem(item.id, 'budget', e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Quantity (Optional)</Label>
                        <Input
                          placeholder="e.g. 2 heaps"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Notes (Optional)</Label>
                        <Input
                          placeholder="e.g. Very ripe ones"
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-6 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full border-dashed" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Item
              </Button>

              {/* Quick add suggestions */}
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {popularItems.slice(0, 6).map((item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        setItems((prev) => [
                          ...prev,
                          { id: Date.now().toString(), name: item.name, budget: '', quantity: '', notes: '' },
                        ])
                      }
                      className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span>{item.emoji}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery details */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved address selector */}
              {addresses.length > 0 && (
                <div className="space-y-2">
                  <Label>Saved Address</Label>
                  <div className="flex flex-wrap gap-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                          selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30',
                        )}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {addr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Location & Digital Address Picker */}
              <div className="pt-1">
                <LocationPicker
                  label="Delivery Location & Digital Address"
                  value={gps}
                  onChange={(newGps, label) => {
                    setGps(newGps);
                    if (label) {
                      setLocationLabel(label);
                    }
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Recipient Full Name</Label>
                  <Input
                    placeholder="e.g. Akosua Mansa"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recipient Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="+233 24 555 0142"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>House No. / Landmark Notes</Label>
                  <span className="text-[11px] text-muted-foreground">Optional</span>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="e.g. House 14, Near Total Station, Flat 2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Delivery Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Today, 2:00 PM – 4:00 PM"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <div className="relative">
                  <StickyNote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    placeholder="e.g. Call when you arrive at the gate"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" />
                    Shopping Budget
                  </span>
                  <span className="font-medium">{formatGHS(shoppingBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    Service Fee (10%)
                  </span>
                  <span className="font-medium">{formatGHS(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery Fee
                  </span>
                  <span className="font-medium">{formatGHS(DELIVERY_FEE)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Estimated Total</span>
                <span className="font-display text-xl">{formatGHS(total)}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                You only pay for what the shopper actually spends. Any unused budget is refunded to your wallet.
              </p>

              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={submitting}>
                {submitting ? 'Creating order...' : 'Proceed to Checkout'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShoppingCart className="h-3.5 w-3.5" />
                {items.length} items in your basket
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
