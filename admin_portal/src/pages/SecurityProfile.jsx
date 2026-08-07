import { useState, useEffect } from "react";
import { authApi, usersApi } from "../services/api";

export default function SecurityProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([
        authApi.me(),
        usersApi.securityProfile(),
      ]);
      setUser(userRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await usersApi.updateSecurityProfile({
        badge_number: profile?.badge_number,
        shift_start: profile?.shift_start,
        shift_end: profile?.shift_end,
        duty_days: profile?.duty_days,
        is_onduty: profile?.is_onduty,
      });
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">View and update your information.</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Email</p>
            <p className="text-base text-slate-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Role</p>
            <p className="text-base text-slate-900 capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Phone</p>
            <p className="text-base text-slate-900">{user?.phone_number || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Member Since</p>
            <p className="text-base text-slate-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Security Details</h2>
        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Badge Number</label>
            <input
              className="input"
              value={profile?.badge_number || ""}
              onChange={(e) => setProfile({ ...profile, badge_number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Shift Start</label>
              <input
                className="input"
                type="time"
                value={profile?.shift_start || ""}
                onChange={(e) => setProfile({ ...profile, shift_start: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Shift End</label>
              <input
                className="input"
                type="time"
                value={profile?.shift_end || ""}
                onChange={(e) => setProfile({ ...profile, shift_end: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Duty Days</label>
            <input
              className="input"
              value={profile?.duty_days || ""}
              onChange={(e) => setProfile({ ...profile, duty_days: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_onduty"
              type="checkbox"
              checked={profile?.is_onduty || false}
              onChange={(e) => setProfile({ ...profile, is_onduty: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_onduty" className="text-sm text-slate-700">On Duty</label>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
