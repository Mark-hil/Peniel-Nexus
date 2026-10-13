import { CustomerSidebar } from '@/components/customer-sidebar';
import { DashboardOverview } from '@/components/dashboard-overview';

export default function DashboardPage() {
  return (
    <CustomerSidebar>
      <DashboardOverview />
    </CustomerSidebar>
  );
}
