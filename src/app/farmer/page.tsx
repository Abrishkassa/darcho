import DashboardLayout from "../(dash)/dashboard-layout";

export default function FarmerHome() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold text-amber-900 mb-4">
        Farmer Dashboard
      </h2>
      <p className="text-amber-700">
        Welcome! Here you can manage your products, orders, and account.
      </p>
    </DashboardLayout>
  );
}
