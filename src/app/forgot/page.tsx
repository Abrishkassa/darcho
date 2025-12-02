"use client";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Password updated successfully!");
    } else {
      setMessage("❌ " + data.error);
    }
  };

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-3 p-4">
      <input className="border p-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input className="border p-2" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

      <button className="bg-amber-800 text-white py-2 rounded">Reset Password</button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
