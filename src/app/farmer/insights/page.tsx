export default function FarmerInsights() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold text-amber-800">Total Sales</h2>
          <p className="text-3xl font-bold text-green-700 mt-3">12,400 Birr</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold text-amber-800">Active Orders</h2>
          <p className="text-3xl font-bold text-amber-800 mt-3">5</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="text-xl font-semibold text-amber-800">Coffee Quality Score</h2>
          <p className="text-3xl font-bold text-blue-700 mt-3">89%</p>
        </div>

      </div>
    </div>
  );
}
