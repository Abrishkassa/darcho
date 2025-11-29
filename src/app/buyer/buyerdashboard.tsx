"use client";

import { useState } from "react";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<
    "home" | "products" | "cart" | "orders" | "profile" | "favorites" | "chats"
  >("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div>
            <h1 className="text-3xl font-bold mb-4 text-amber-900">Welcome to Buyer Portal</h1>
            <p className="mb-6 text-amber-900/90">Explore coffee products and manage your orders.</p>
          </div>
        );

      case "products":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-amber-900">Products</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                  <h2 className="font-semibold mb-1">Coffee {i + 1}</h2>
                  <p className="text-gray-700">Origin: Ethiopia | Price: 100 ETB/kg</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "cart":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-amber-900">Your Cart</h1>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between mb-2">
                <span>Coffee A</span>
                <span>100 ETB</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Coffee B</span>
                <span>120 ETB</span>
              </div>
              <div className="flex justify-between font-bold mt-4">
                <span>Total</span>
                <span>220 ETB</span>
              </div>
            </div>
            <button className="mt-4 px-6 py-2 rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition">
              Checkout
            </button>
          </div>
        );

      case "orders":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-amber-900">Orders</h1>
            <ul className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between">
                    <span>Order #{1000 + i}</span>
                    <span className="text-amber-800 font-semibold">Shipped</span>
                  </div>
                  <p className="text-gray-700">3 kg of Coffee A</p>
                </li>
              ))}
            </ul>
          </div>
        );

      case "profile":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-amber-900">Profile</h1>
            <form className="bg-white p-6 rounded-xl shadow max-w-md space-y-4">
              <input className="w-full p-2 border rounded" placeholder="Full Name" />
              <input className="w-full p-2 border rounded" placeholder="Email" />
              <input className="w-full p-2 border rounded" placeholder="Phone" />
              <input className="w-full p-2 border rounded" placeholder="Region" />
              <button className="w-full py-2 rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition">
                Save Changes
              </button>
            </form>
          </div>
        );

      case "favorites":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-amber-900">Favorites</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                  Coffee {i + 1}
                </div>
              ))}
            </div>
          </div>
        );

      case "chats":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-amber-900">Chats</h1>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow flex justify-between">
                  <span>Farmer {i + 1}</span>
                  <button className="text-amber-800 font-semibold">Open Chat</button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-amber-50">
      {/* Sidebar */}
      <aside className="w-64 bg-amber-900 text-white p-6 flex flex-col gap-4">
        {["home", "products", "cart", "orders", "profile", "favorites", "chats"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`text-left px-4 py-2 rounded-lg hover:bg-amber-800 transition ${
              activeTab === tab ? "bg-amber-800 font-semibold" : ""
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}
