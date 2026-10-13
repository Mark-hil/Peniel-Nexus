import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminCustomers } from '@/components/admin-customers';

export default function AdminCustomersPage() {
  return (
    <AdminSidebar>
      <AdminCustomers />
    </AdminSidebar>
  );
}
