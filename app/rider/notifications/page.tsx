import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { NotificationsList } from '@/components/notifications-list';

export default function RiderNotificationsPage() {
  return (
    <FieldStaffSidebar role="rider">
      <NotificationsList />
    </FieldStaffSidebar>
  );
}
