import { useEffect, useState } from "react";
import { sosApi, usersApi } from "../services/api";

export default function VolunteerDashboard() {
  const [sosList, setSosList] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadData = async () => {
    try {
      const [sosRes, profileRes] = await Promise.all([
        sosApi.list(),
        usersApi.volunteerProfile(),
      ]);
      setSosList(sosRes.data.results || sosRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
      alert("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAvailabilityToggle = async () => {
    try {
      await usersApi.updateVolunteerProfile({
        is_available: !profile?.is_available,
      });
      await loadData();
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Unable to update availability status. Please try again.");
    }
  };

  const handleAccept = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await sosApi.updateStatus(id, "acknowledged");
      await loadData();
    } catch (err) {
      console.error("Failed to accept SOS:", err);
      alert("Unable to accept incident. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const availableCount = sosList.filter(
    (s) => s.status === "acknowledged"
  ).length;
  const pendingCount = sosList.filter((s) => s.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading volunteer dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your availability and incidents.
          </p>
        </div>
        <button
          onClick={handleAvailabilityToggle}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm ${
            profile?.is_available
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {profile?.is_available ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Available Incidents</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{pendingCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">My Assigned</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{availableCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total SOS</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{sosList.length}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Incident List</h2>
        {sosList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No incidents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {sosList.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">SOS-{item.id}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{item.category?.name || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{item.address || "-"}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleAccept(item.id)}
                          disabled={actionLoading[item.id]}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          {actionLoading[item.id] ? "Accepting..." : "Accept"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
