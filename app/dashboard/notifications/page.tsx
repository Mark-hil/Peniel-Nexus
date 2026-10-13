import { CustomerSidebar } from '@/components/customer-sidebar';
import { NotificationsList } from '@/components/notifications-list';

export default function NotificationsPage() {
  return (
    <CustomerSidebar>
      <NotificationsList />
    </CustomerSidebar>
  );
}
