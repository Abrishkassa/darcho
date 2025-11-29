export default function FarmerProfile() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-xl">
        <div className="mb-4">
          <label className="text-amber-900 font-medium">Full Name</label>
          <input className="w-full p-3 bg-amber-50 rounded-lg mt-1" defaultValue="Kassa Mekonnen" />
        </div>

        <div className="mb-4">
          <label className="text-amber-900 font-medium">Phone</label>
          <input className="w-full p-3 bg-amber-50 rounded-lg mt-1" defaultValue="+251900000000" />
        </div>

        <div className="mb-4">
          <label className="text-amber-900 font-medium">Region</label>
          <input className="w-full p-3 bg-amber-50 rounded-lg mt-1" defaultValue="Oromia" />
        </div>

        <button className="px-6 py-3 bg-amber-700 text-white rounded-lg">
          Save Changes
        </button>
      </div>
    </div>
  );
}
