'use client';

import * as React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  KeyRound,
  Bell,
  Shield,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddressDialog } from '@/components/address-dialog';
import { useSavedAddresses } from '@/hooks/use-saved-addresses';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { SavedAddress } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const { addresses, addAddress, updateAddress, removeAddress } = useSavedAddresses();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SavedAddress | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [savingProfile, setSavingProfile] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (addr: SavedAddress) => {
    setEditing(addr);
    setDialogOpen(true);
  };

  const handleSave = async (data: Omit<SavedAddress, 'id'>) => {
    if (editing) {
      await updateAddress(editing.id, data);
      toast.success('Address updated successfully.');
    } else {
      await addAddress(data);
      toast.success('Address added successfully.');
    }
    setEditing(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      removeAddress(deleteId);
      toast.success('Address removed.');
      setDeleteId(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('You must be signed in to update your profile.');
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', user.id);

    setSavingProfile(false);
    if (error) {
      toast.error('Could not save profile changes.');
    } else {
      toast.success('Profile updated successfully.');
    }
  };

  const displayName = fullName || user?.fullName || 'Ama Owusu';
  const displayEmail = user?.email || 'ama.owusu@gmail.com';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AO';

  return (
    <CustomerSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="border-border/60 lg:col-span-1">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300" />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              <div className="mt-4 flex gap-4">
                <div className="text-center">
                  <p className="font-display text-xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <Separator orientation="vertical" />
                <div className="text-center">
                  <p className="font-display text-xl font-bold">GHS 3,450</p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit profile */}
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
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ama Owusu"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+233 24 555 0142"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={displayEmail}
                      disabled
                      className="pl-9 bg-muted/40 cursor-not-allowed"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Saved addresses */}
            <Card className="border-border/60">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Saved Addresses</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-medium">No saved addresses</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add an address to speed up checkout.
                    </p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{addr.label}</p>
                        <p className="text-sm text-muted-foreground">{addr.address}</p>
                        <p className="text-xs text-muted-foreground">GPS: {addr.gps}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(addr)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(addr.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Change password */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            {/* Notification preferences */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: 'Order updates', desc: 'Get notified about order status changes', defaultChecked: true },
                  { label: 'Delivery alerts', desc: 'Notifications when your rider is nearby', defaultChecked: true },
                  { label: 'Promotions', desc: 'Special offers and discounts', defaultChecked: false },
                  { label: 'Newsletter', desc: 'Weekly market updates and tips', defaultChecked: false },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <Switch defaultChecked={pref.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddressDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} editing={editing} />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the saved address from your address book. You can always add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CustomerSidebar>
  );
}
