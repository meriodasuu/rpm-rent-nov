import { AdminBookingWorkspace } from "@/components/admin/admin-booking-workspace";
import { getStore } from "@/lib/data";
import { parseAdminBookingFilter } from "@/lib/admin-operations";

export const metadata = { title: "Заявки" };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; booking?: string }>;
}) {
  const store = await getStore();
  const [bookings, leads, query] = await Promise.all([
    store.getBookings(),
    store.getLeads(),
    searchParams,
  ]);

  return (
    <AdminBookingWorkspace
      bookings={bookings}
      leads={leads}
      initialFilter={parseAdminBookingFilter(query.filter)}
      initialBookingId={query.booking}
      now={new Date().toISOString()}
    />
  );
}
