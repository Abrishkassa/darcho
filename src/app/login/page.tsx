"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Login successful!");

      // ⭐ ROLE-BASED REDIRECTION
      if (data.role === "farmer") {
        router.push("/farmer");
      } else if (data.role === "buyer") {
        router.push("/buyer");
      } else if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/"); // fallback
      }
    } else {
      setMessage("❌ " + data.error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3 p-4">
      <input
        className="border p-2"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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

      <button className="bg-amber-800 text-white py-2 rounded">
        Login
      </button>

      <p
        className="text-sm text-blue-600 cursor-pointer mt-2"
        onClick={() => (window.location.href = "/forgot")}
      >
        Forgot password?
      </p>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
