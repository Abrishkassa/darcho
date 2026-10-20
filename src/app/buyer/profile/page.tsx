"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Save, Pencil, X, CheckCircle, User, Building2, MapPin, Phone, Mail, Globe, BadgeCheck } from "lucide-react";
import { useBuyerTheme } from "../theme-context";

interface ProfileData {
  user: {
    id?: number;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    isVerified?: boolean;
  };
  buyer?: {
    companyName?: string | null;
    businessType?: string | null;
    location?: string | null;
    website?: string | null;
    taxId?: string | null;
    buyerType?: string | null;
    annualPurchaseCapacity?: number | null;
    preferredRegions?: string[] | null;
  } | null;
}

interface FormState {
  fullName: string;
  phone: string;
  companyName: string;
  businessType: string;
  location: string;
  website: string;
}

export default function BuyerProfilePage() {
  const { dark } = useBuyerTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    companyName: "",
    businessType: "",
    location: "",
    website: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/buyer/profile");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load profile");
      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const startEditing = () => {
    if (!profile) return;
    setForm({
      fullName: profile.user?.fullName || "",
      phone: profile.user?.phone || "",
      companyName: profile.buyer?.companyName || "",
      businessType: profile.buyer?.businessType || "",
      location: profile.buyer?.location || "",
      website: profile.buyer?.website || "",
    });
    setSaveError(null);
    setSaved(false);
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/buyer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save profile");
      setProfile(data.data || { ...profile!, user: { ...profile!.user, ...form }, buyer: { ...profile!.buyer, companyName: form.companyName, businessType: form.businessType, location: form.location, website: form.website } });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`;

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className={`p-6 rounded-2xl border animate-pulse ${cardBorder}`}>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`p-10 rounded-2xl border text-center ${cardBorder}`}>
        <p className="text-red-500 font-medium mb-4">{error || "Failed to load profile"}</p>
        <button
          onClick={fetchProfile}
          className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const { user, buyer } = profile;

  const details = [
    { icon: User, label: "Full Name", value: user?.fullName },
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Phone, label: "Phone", value: user?.phone },
    { icon: Building2, label: "Company", value: buyer?.companyName },
    { icon: BadgeCheck, label: "Business Type", value: buyer?.businessType },
    { icon: MapPin, label: "Location", value: buyer?.location },
    { icon: Globe, label: "Website", value: buyer?.website },
    { icon: Building2, label: "Buyer Type", value: buyer?.buyerType },
  ];

  const editFields: { key: keyof FormState; label: string; type?: string; placeholder?: string }[] = [
    { key: "fullName", label: "Full Name", placeholder: "Your full name" },
    { key: "phone", label: "Phone", type: "tel", placeholder: "+251..." },
    { key: "companyName", label: "Company Name", placeholder: "Company or business name" },
    { key: "businessType", label: "Business Type", placeholder: "e.g. Exporter, Roaster" },
    { key: "location", label: "Location", placeholder: "City, Region" },
    { key: "website", label: "Website", placeholder: "https://..." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingText}`}>My Profile</h1>
          <p className={`mt-1 ${mutedText}`}>Manage your account and business information</p>
        </div>
        {!editing && (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors self-start"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Profile updated successfully
        </div>
      )}

      {/* Account card */}
      <section className={`p-6 rounded-2xl border shadow-sm ${cardBorder}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">
              {(user?.fullName || "B").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className={`text-xl font-bold truncate ${headingText}`}>{user?.fullName || "Buyer"}</h2>
            <p className={`text-sm truncate ${mutedText}`}>{user?.email}</p>
            <span
              className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full capitalize ${
                user?.isVerified
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {user?.isVerified ? "Verified account" : "Pending verification"}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {editFields.map((field) => (
                <div key={field.key} className={field.key === "website" ? "sm:col-span-2" : ""}>
                  <label
                    htmlFor={`profile-${field.key}`}
                    className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {field.label}
                  </label>
                  <input
                    id={`profile-${field.key}`}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            {saveError && <p className="text-sm text-red-500">{saveError}</p>}

            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                disabled={saving || !form.fullName.trim() || !form.phone.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                  dark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {details
              .filter((d) => d.value)
              .map((detail) => (
                <div key={detail.label} className="flex items-start gap-3">
                  <detail.icon className={`w-5 h-5 mt-0.5 shrink-0 ${mutedText}`} />
                  <div className="min-w-0">
                    <dt className={`text-xs uppercase tracking-wide ${mutedText}`}>{detail.label}</dt>
                    <dd className={`font-medium truncate ${headingText}`}>{detail.value}</dd>
                  </div>
                </div>
              ))}
          </dl>
        )}
      </section>

      {/* Buyer stats */}
      <section className={`p-6 rounded-2xl border shadow-sm ${cardBorder}`}>
        <h2 className={`text-lg font-semibold mb-4 ${headingText}`}>Business Details</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className={mutedText}>Annual Purchase Capacity</p>
            <p className={`font-semibold mt-1 ${headingText}`}>
              {buyer?.annualPurchaseCapacity ? `${buyer.annualPurchaseCapacity.toLocaleString()} kg` : "Not set"}
            </p>
          </div>
          <div>
            <p className={mutedText}>Preferred Regions</p>
            <p className={`font-semibold mt-1 ${headingText}`}>
              {buyer?.preferredRegions?.length ? buyer.preferredRegions.join(", ") : "Not set"}
            </p>
          </div>
          <div>
            <p className={mutedText}>Tax ID</p>
            <p className={`font-semibold mt-1 ${headingText}`}>{buyer?.taxId || "Not set"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
