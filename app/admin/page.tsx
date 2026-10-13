import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminDashboardHome } from '@/components/admin-dashboard-home';

export default function AdminPage() {
  return (
    <AdminSidebar>
      <AdminDashboardHome />
    </AdminSidebar>
  );
}
