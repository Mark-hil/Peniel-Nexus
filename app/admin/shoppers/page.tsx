'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { TeamManagement } from '@/components/team-management';
import { useAdminData } from '@/hooks/use-admin-data';

export default function AdminShoppersPage() {
  const { teamMembers, loading } = useAdminData();
  const shoppers = teamMembers.filter((m) => m.role === 'shopper');

  return (
    <AdminSidebar>
      <TeamManagement team={shoppers} role="Shopper" loading={loading} />
    </AdminSidebar>
  );
}
