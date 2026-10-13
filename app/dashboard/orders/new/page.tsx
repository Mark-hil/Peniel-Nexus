import { CustomerSidebar } from '@/components/customer-sidebar';
import { CreateOrder } from '@/components/create-order';

export default function NewOrderPage() {
  return (
    <CustomerSidebar>
      <CreateOrder />
    </CustomerSidebar>
  );
}
