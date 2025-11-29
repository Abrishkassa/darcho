export default function FarmerProducts() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">My Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-amber-800">Coffee Grade A</h2>
            <p className="text-amber-900/80 mt-2 text-sm">100 kg available</p>
            <button className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg w-full">
              Edit Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
