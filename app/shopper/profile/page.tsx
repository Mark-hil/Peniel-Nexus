'use client';

import * as React from 'react';
import {
  User,
  Mail,
  Phone,
  Star,
  Award,
  ShoppingCart,
  Camera,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth-provider';
import { useShopperOrders } from '@/hooks/use-shopper-orders';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ShopperProfilePage() {
  const { user } = useAuth();
  const { earnings } = useShopperOrders();
  const [fullName, setFullName] = React.useState(user?.fullName ?? '');
  const [phone, setPhone] = React.useState(user?.phone ?? '');
  const [saving, setSaving] = React.useState(false);

  const initials = (user?.fullName ?? 'S')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user?.id);
    setSaving(false);
    if (error) {
      toast.error('Could not save changes. Please try again.');
    } else {
      toast.success('Profile updated successfully.');
    }
  };

  return (
    <FieldStaffSidebar role="shopper">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and view your performance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">{user?.fullName ?? 'Shopper'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShoppingCart className="h-3.5 w-3.5" />
                Shopper
              </div>
              <div className="mt-4 flex gap-4">
                <div className="text-center">
                  <p className="font-display text-xl font-bold">{earnings.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <Separator orientation="vertical" />
                <div className="text-center">
                  <p className="flex items-center justify-center gap-0.5 font-display text-xl font-bold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    4.9
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={user?.email ?? ''} disabled className="pl-9" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Total Orders', value: earnings.totalOrders.toString() },
                    { label: 'This Month', value: earnings.totalOrders.toString() },
                    { label: 'Acceptance Rate', value: '98%' },
                    { label: 'On-Time Rate', value: '95%' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-muted/40 p-4 text-center">
                      <p className="font-display text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FieldStaffSidebar>
  );
}
