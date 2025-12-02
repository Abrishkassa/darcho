"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const [fullname, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [residence, setResidenceArea] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer"); // ⭐ Added
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
        role, // ⭐ Added
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // ⭐ Redirect based on user role
      if (role === "buyer") router.push("/buyer");
      else router.push("/farmer");
    } else {
      setMessage("❌ " + data.error);
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-3 p-4">
      <input
        className="border p-2"
        placeholder="Full Name"
        value={fullname}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <input
        className="border p-2"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      <input
        className="border p-2"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Residence Area"
        value={residence}
        onChange={(e) => setResidenceArea(e.target.value)}
        required
      />

      <input
        className="border p-2"
        placeholder="Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        required
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* ⭐ Added user role dropdown */}
      <select
        className="border p-2"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="buyer">Buyer</option>
        <option value="farmer">Farmer</option>
      </select>

      <button className="bg-amber-800 text-white py-2 rounded">
        Register
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
