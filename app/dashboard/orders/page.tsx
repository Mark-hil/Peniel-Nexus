import { CustomerSidebar } from '@/components/customer-sidebar';
import { OrdersList } from '@/components/orders-list';

export default function MyOrdersPage() {
  return (
    <CustomerSidebar>
      <OrdersList />
    </CustomerSidebar>
  );
}
