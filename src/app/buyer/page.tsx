"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function BuyerPortal() {
  const [activeTab, setActiveTab] = useState<"products" | "cart" | "orders" | "profile" | "favorites" | "chats">("products");

  const tabs = [
    { id: "products", label: "Products" },
    { id: "cart", label: "Cart" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Profile" },
    { id: "favorites", label: "Favorites" },
    { id: "chats", label: "Chats" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-white shadow-md rounded-xl">
              <h3 className="font-semibold mb-1">Coffee Beans</h3>
              <p className="text-sm text-gray-600">Farmer: Abriham</p>
              <p className="text-sm text-gray-600">Price: ₮ 1,200/kg</p>
            </div>
            <div className="p-4 bg-white shadow-md rounded-xl">
              <h3 className="font-semibold mb-1">Arabica Beans</h3>
              <p className="text-sm text-gray-600">Farmer: Selam</p>
              <p className="text-sm text-gray-600">Price: ₮ 1,500/kg</p>
            </div>
          </div>
        );
      case "cart":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-amber-800 text-white">
                  <th className="py-2 px-4">Product</th>
                  <th className="py-2 px-4">Farmer</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">Coffee Beans</td>
                  <td className="py-2 px-4">Abriham</td>
                  <td className="py-2 px-4">20kg</td>
                  <td className="py-2 px-4">₮ 24,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "orders":
        return <p className="text-gray-700">Order history content here</p>;
      case "profile":
        return (
          <div className="p-6 bg-white shadow-lg rounded-xl max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Profile</h3>
            <p><strong>Name:</strong> Selam Desta</p>
            <p><strong>Email:</strong> selam@example.com</p>
            <p><strong>Address:</strong> Addis Ababa, Ethiopia</p>
          </div>
        );
      case "favorites":
        return <p className="text-gray-700">Favorite products here</p>;
      case "chats":
        return <p className="text-gray-700">Chat with farmers / support</p>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <h1 className="text-4xl font-bold text-amber-900 mb-6 text-center">Buyer Portal</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
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
