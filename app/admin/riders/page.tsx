'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { TeamManagement } from '@/components/team-management';
import { useAdminData } from '@/hooks/use-admin-data';

export default function AdminRidersPage() {
  const { teamMembers, loading } = useAdminData();
  const riders = teamMembers.filter((m) => m.role === 'rider');

  return (
    <AdminSidebar>
      <TeamManagement team={riders} role="Rider" loading={loading} />
    </AdminSidebar>
  );
}
