import DashboardLayout from "../(dash)/dashboard-layout";

export default function AdminHome() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold text-amber-900 mb-4">
        Admin Dashboard
      </h2>
      <p className="text-amber-700">
        Manage users, farmers, buyers, products, and system settings.
      </p>
    </DashboardLayout>
  );
}
