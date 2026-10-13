import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { NotificationsList } from '@/components/notifications-list';

export default function ShopperNotificationsPage() {
  return (
    <FieldStaffSidebar role="shopper">
      <NotificationsList />
    </FieldStaffSidebar>
  );
}
