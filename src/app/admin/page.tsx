"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "products" | "orders" | "analytics" | "settings"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-2xl font-bold">1,245</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
              <p className="text-2xl font-bold">3,872</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Revenue</h3>
              <p className="text-2xl font-bold">₮ 125,000</p>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-amber-800 text-white">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Role</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">1</td>
                  <td className="py-2 px-4">Abriham Kassa</td>
                  <td className="py-2 px-4">abriham@example.com</td>
                  <td className="py-2 px-4">Farmer</td>
                  <td className="py-2 px-4">
                    <button className="px-2 py-1 bg-amber-700 text-white rounded hover:bg-amber-800 transition">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "products":
        return (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-white shadow-md rounded-xl">
              <h3 className="font-semibold mb-1">Product 1</h3>
              <p className="text-sm text-gray-600">Farmer: Abriham</p>
              <p className="text-sm text-gray-600">Price: ₮ 1,200/kg</p>
            </div>
            <div className="p-4 bg-white shadow-md rounded-xl">
              <h3 className="font-semibold mb-1">Product 2</h3>
              <p className="text-sm text-gray-600">Farmer: Selam</p>
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
                  <th className="py-2 px-4">User</th>
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
                  <td className="py-2 px-4">50kg</td>
                  <td className="py-2 px-4 text-green-700 font-semibold">Completed</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "analytics":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
              <p className="text-sm text-gray-600">Chart placeholder</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold mb-2">User Activity</h3>
              <p className="text-sm text-gray-600">Chart placeholder</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <p className="text-gray-600">Admin preferences go here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-amber-50">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 64 : 20 }}
        className="bg-amber-900 text-white flex flex-col transition-all duration-300"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-amber-700">
          <span className={`font-bold text-lg ${sidebarOpen ? "block" : "hidden"}`}>Admin</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        <div className="flex-1 mt-4 flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-left hover:bg-amber-800 transition ${
                activeTab === tab.id ? "bg-amber-700 font-semibold" : ""
              }`}
            >
              {sidebarOpen ? tab.label : tab.label.charAt(0)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-amber-900 mb-6">{tabs.find(t => t.id === activeTab)?.label}</h1>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </main>
    </div>
  );
}
