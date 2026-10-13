import { Moon, Globe, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const settingsGroups = [
  {
    title: 'Appearance',
    icon: Moon,
    items: [
      { label: 'Dark mode', desc: 'Switch between light and dark themes', type: 'switch' as const, defaultChecked: false },
    ],
  },
  {
    title: 'Localization',
    icon: Globe,
    items: [
      { label: 'Language', desc: 'Display language', type: 'select' as const, options: ['English', 'Twi', 'Ga', 'Hausa'], defaultValue: 'English' },
      { label: 'Currency', desc: 'Preferred currency', type: 'select' as const, options: ['GHS (₵)', 'USD ($)', 'EUR (€)'], defaultValue: 'GHS (₵)' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Push notifications', desc: 'Receive push alerts on your device', type: 'switch' as const, defaultChecked: true },
      { label: 'Email notifications', desc: 'Receive updates via email', type: 'switch' as const, defaultChecked: true },
      { label: 'SMS notifications', desc: 'Receive text message alerts', type: 'switch' as const, defaultChecked: false },
    ],
  },
  {
    title: 'Privacy & Security',
    icon: Shield,
    items: [
      { label: 'Two-factor authentication', desc: 'Add an extra layer of security', type: 'switch' as const, defaultChecked: false },
      { label: 'Biometric login', desc: 'Use fingerprint or face unlock', type: 'switch' as const, defaultChecked: false },
    ],
  },
];

export default function SettingsPage() {
  return (
    <CustomerSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your app preferences and account configuration.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {settingsGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.title} className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {group.items.map((item, i) => (
                    <div key={item.label}>
                      {i > 0 && <Separator className="my-1" />}
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        {item.type === 'switch' ? (
                          <Switch defaultChecked={item.defaultChecked} />
                        ) : (
                          <Select defaultValue={item.defaultValue}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help + logout */}
        <Card className="border-border/60">
          <CardContent className="p-2">
            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Help & Support</p>
                  <p className="text-xs text-muted-foreground">Get help with your account</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator />
            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left text-destructive transition-colors hover:bg-destructive/5">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Logout</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </CustomerSidebar>
  );
}
