"use client";

import { useEffect, useState } from "react";

interface FarmerProfile {
  id: number | string;
  fullname: string;
  phone: string;
  email?: string;
  region: string;
  residence: string;
  farm_size?: string;
  years_farming?: number;
  joined_date?: string;
}

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/farmer/profile");
        
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();

        // Handle different response formats
        if (data.profile) {
          setProfile(data.profile);
        } else if (data) {
          setProfile(data);
        } else {
          throw new Error("No profile data received");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      const res = await fetch("/api/farmer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
      // Show success message
      alert("Profile updated successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
    }
  };

  const handleInputChange = (field: keyof FarmerProfile, value: string) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading profile...</p>
        <p className="text-sm text-gray-400 mt-2">Fetching your information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-3xl">👨‍🌾</span>
          </div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-4">Please create your farmer profile</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Farmer Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              isEditing
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-amber-100">
              {/* Profile Header */}
              <div className="bg-amber-800 text-white p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-amber-800 text-3xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.fullname}</h2>
                    <p className="text-amber-200">Farmer Account</p>
                    {profile.joined_date && (
                      <p className="text-sm text-amber-300 mt-1">
                        Member since {new Date(profile.joined_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                  Personal Information
                </h3>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.fullname}
                          onChange={(e) => handleInputChange("fullname", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-900 font-medium">{profile.fullname}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="Add your email"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.email || "Not provided"}</p>
                      )}
                    </div>
                  </div>

                  {/* Region */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <select
                          value={profile.region}
                          onChange={(e) => handleInputChange("region", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="Oromia">Oromia</option>
                          <option value="Amhara">Amhara</option>
                          <option value="SNNPR">SNNPR</option>
                          <option value="Tigray">Tigray</option>
                          <option value="Somali">Somali</option>
                          <option value="Afar">Afar</option>
                          <option value="Addis Ababa">Addis Ababa</option>
                        </select>
                      ) : (
                        <p className="text-lg text-gray-900">{profile.region}</p>
                      )}
                    </div>
                  </div>

                  {/* Residence */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Residence</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.residence}
                          onChange={(e) => handleInputChange("residence", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.residence}</p>
                      )}
                    </div>
                  </div>

                  {/* Farm Size */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Farm Size</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.farm_size || ""}
                          onChange={(e) => handleInputChange("farm_size", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="e.g., 5 hectares"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.farm_size || "Not specified"}</p>
                      )}
                    </div>
                  </div>

                  {/* Years Farming */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Years Farming</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={profile.years_farming || ""}
                          onChange={(e) => handleInputChange("years_farming", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="e.g., 10"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">
                          {profile.years_farming ? `${profile.years_farming} years` : "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button for Edit Mode */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                    >
                      <span>💾</span>
                      <span>Save Changes</span>
                    </button>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Click save to update your profile information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="text-xl font-bold text-amber-700">Verified Farmer</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Since</p>
                  <p className="text-xl font-bold text-green-700">
                    {profile.joined_date 
                      ? new Date(profile.joined_date).toLocaleDateString()
                      : "Recently"
                    }
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="text-xl font-bold text-blue-700">{profile.region}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition">
                  View Orders
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                  Update Products
                </button>
                <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                  Account Settings
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                  Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}