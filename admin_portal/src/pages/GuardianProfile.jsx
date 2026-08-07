import { useState, useEffect } from "react";
import { authApi } from "../services/api";

export default function GuardianProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

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
        <p className="text-sm text-slate-500 mt-1">View your account information.</p>
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
    </div>
  );
}
