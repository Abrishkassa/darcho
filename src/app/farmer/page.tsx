"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function FarmerPortal() {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "profile" | "insights">("products");

  const tabs = [
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Profile" },
    { id: "insights", label: "Insights" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-white shadow-md rounded-xl">
              <h3 className="font-semibold mb-1">Coffee Beans</h3>
              <p className="text-sm text-gray-600">Available: 50kg</p>
              <p className="text-sm text-gray-600">Price: ₮ 1,200/kg</p>
            </div>
            <div className="p-4 bg-white shadow-md rounded-xl">
              <h3 className="font-semibold mb-1">Arabica Beans</h3>
              <p className="text-sm text-gray-600">Available: 30kg</p>
              <p className="text-sm text-gray-600">Price: ₮ 1,500/kg</p>
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-amber-800 text-white">
                  <th className="py-2 px-4">Order ID</th>
                  <th className="py-2 px-4">Buyer</th>
                  <th className="py-2 px-4">Product</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">1001</td>
                  <td className="py-2 px-4">Selam Desta</td>
                  <td className="py-2 px-4">Coffee Beans</td>
                  <td className="py-2 px-4">20kg</td>
                  <td className="py-2 px-4 text-green-700 font-semibold">Confirmed</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "profile":
        return (
          <div className="p-6 bg-white shadow-lg rounded-xl max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Profile</h3>
            <p><strong>Name:</strong> Abriham Kassa</p>
            <p><strong>Phone:</strong> +251 912 345 678</p>
            <p><strong>Region:</strong> Oromia</p>
            <p><strong>Residence:</strong> Addis Ababa</p>
          </div>
        );
      case "insights":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
              <p className="text-gray-600">Chart placeholder</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Stock Insights</h3>
              <p className="text-gray-600">Chart placeholder</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <h1 className="text-4xl font-bold text-amber-900 mb-6 text-center">Farmer Portal</h1>

      <div className="flex justify-center gap-4 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === tab.id
                ? "bg-amber-800 text-white"
                : "bg-white border border-amber-200 text-amber-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}
