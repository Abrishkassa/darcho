"use client";
import { useState } from "react";

export default function RegisterForm() {
  const [fullname, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [residence, setResidenceArea] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname,
        phone,
        email,
        residence,
        region,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Registered successfully! You can now login.");
    } else {
      setMessage("❌ " + data.error);
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-3 p-4">
      <input className="border p-2" placeholder="Full Name" value={fullname} onChange={(e) => setFullName(e.target.value)} required />
      <input className="border p-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input className="border p-2" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2" placeholder="Residence Area" value={residence} onChange={(e) => setResidenceArea(e.target.value)} required />
      <input className="border p-2" placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} required />
      <input className="border p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      <button className="bg-amber-800 text-white py-2 rounded">Register</button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
