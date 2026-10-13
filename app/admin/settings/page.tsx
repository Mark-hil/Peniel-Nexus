import {
  Store,
  Bell,
  CreditCard,
  Truck,
  Users,
  Shield,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminSettingsPage() {
  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your business operations and preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Business profile */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="h-4 w-4 text-primary" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="Peniel Nexus Ghana Ltd" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input defaultValue="hello@penielnexus.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+233 30 555 0100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service Areas</Label>
                <Input defaultValue="Accra, Kumasi, Tema" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                Fees & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Service Fee (%)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    <Input type="number" defaultValue="10" className="pl-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Fee (GHS)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                    <Input type="number" defaultValue="15" className="pl-7" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Order Value</Label>
                <Input type="number" defaultValue="20" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="GHS">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS (₵)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Update Fees</Button>
            </CardContent>
          </Card>

          {/* Delivery settings */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-primary" />
                Delivery Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Auto-assign riders', desc: 'Automatically assign the nearest available rider', checked: true },
                { label: 'Auto-assign shoppers', desc: 'Automatically assign available shoppers', checked: false },
                { label: 'Live tracking', desc: 'Enable real-time GPS tracking for customers', checked: true },
                { label: 'Contactless delivery', desc: 'Allow contactless drop-off option', checked: true },
              ].map((s, i) => (
                <div key={s.label}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <Switch defaultChecked={s.checked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Admin Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'New order alerts', desc: 'Get notified when a new order is placed', checked: true },
                { label: 'Payment failures', desc: 'Alert on failed or refunded transactions', checked: true },
                { label: 'Low inventory', desc: 'Notify when popular items run low', checked: false },
                { label: 'Daily summary', desc: 'Receive a daily performance summary email', checked: true },
              ].map((s, i) => (
                <div key={s.label}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <Switch defaultChecked={s.checked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team permissions */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Team Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Allow shoppers to update status', desc: 'Shoppers can mark orders as shopping/packed', checked: true },
                { label: 'Allow riders to confirm delivery', desc: 'Riders can mark orders as delivered', checked: true },
                { label: 'Require admin approval for refunds', desc: 'Refunds need admin confirmation', checked: true },
              ].map((s, i) => (
                <div key={s.label}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <Switch defaultChecked={s.checked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Two-factor authentication', desc: 'Require 2FA for all admin accounts', checked: true },
                { label: 'Session timeout', desc: 'Auto-logout after 30 minutes of inactivity', checked: true },
                { label: 'IP whitelist', desc: 'Restrict admin access to specific IPs', checked: false },
              ].map((s, i) => (
                <div key={s.label}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <Switch defaultChecked={s.checked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}
