import { useState, useEffect } from "react";
import { User, Mail, Save, AlertCircle } from "lucide-react";
import { getCsrfTokenFromCookie } from "../utils/csrf";

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setUserProfile(data);
        setUsername(data.username);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const csrfToken = getCsrfTokenFromCookie();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }
      const updatedUser = await res.json();
      setUserProfile(updatedUser);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-stone-400 text-sm">
        Loading profile...
      </div>
    );
  if (!userProfile)
    return (
      <div className="text-center py-10 text-red-600 text-sm">
        Failed to load profile.
      </div>
    );

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-4 h-4 text-stone-500" />
        <h2 className="text-lg font-semibold text-stone-800">My Profile</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✓ Profile updated!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={userProfile.email}
              disabled
              className="w-full bg-stone-100 border border-stone-200 rounded-lg py-2 pl-9 pr-3 text-stone-500 text-sm cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Email cannot be changed.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Display Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg py-2 pl-9 pr-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors text-sm"
              placeholder="Your username"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || username === userProfile.username}
          className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-[#EFE4D2] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
