import DashboardLayout from "../(dash)/dashboard-layout";

export default function BuyerHome() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold text-amber-900 mb-4">
        Buyer Dashboard
      </h2>
      <p className="text-amber-700">
        Browse products, manage orders, and update your profile.
      </p>
    </DashboardLayout>
  );
}
