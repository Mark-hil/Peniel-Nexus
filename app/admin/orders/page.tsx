import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminOrdersTable } from '@/components/admin-orders-table';

export default function AdminOrdersPage() {
  return (
    <AdminSidebar>
      <AdminOrdersTable />
    </AdminSidebar>
  );
}
