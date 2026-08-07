import { useEffect, useState } from "react";
import { sosApi } from "../services/api";

export default function SecurityDashboard() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadSOS = async () => {
    try {
      const res = await sosApi.list();
      setSosList(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load SOS:", err);
      alert("Unable to load security alerts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSOS();
  }, []);

  const handleAccept = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await sosApi.updateStatus(id, "acknowledged");
      await loadSOS();
    } catch (err) {
      console.error("Failed to accept SOS:", err);
      alert("Unable to accept alert. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleResolve = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await sosApi.updateStatus(id, "resolved");
      await loadSOS();
    } catch (err) {
      console.error("Failed to resolve SOS:", err);
      alert("Unable to resolve incident. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const activeSOS = sosList.filter(
    (s) => s.status === "pending" || s.status === "acknowledged"
  );
  const resolvedSOS = sosList.filter((s) => s.status === "resolved");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Security Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor and manage SOS alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Alerts</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{activeSOS.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Resolved</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{resolvedSOS.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{sosList.length}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">SOS Alerts</h2>
        {activeSOS.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No active SOS alerts.</div>
        ) : (
          <div className="space-y-4">
            {activeSOS.map((sos) => (
              <div
                key={sos.id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">SOS-{sos.id}</p>
                    <p className="text-base font-semibold text-slate-900">
                      {sos.category?.name || "Unknown category"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      sos.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : sos.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sos.status}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  <p>
                    <strong>Resident:</strong> {sos.resident?.email || "Unknown"}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(sos.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Message:</strong> {sos.message || "No message"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {sos.latitude && sos.longitude
                      ? `${sos.latitude}, ${sos.longitude}`
                      : "Not provided"}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {sos.address || "No address provided"}
                </p>
                <div className="flex gap-3 mt-4">
                  {sos.status === "pending" && (
                    <button
                      onClick={() => handleAccept(sos.id)}
                      disabled={actionLoading[sos.id]}
                      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-green-400"
                    >
                      {actionLoading[sos.id] ? "Accepting..." : "Accept"}
                    </button>
                  )}
                  {sos.status === "acknowledged" && (
                    <button
                      onClick={() => handleResolve(sos.id)}
                      disabled={actionLoading[sos.id]}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {actionLoading[sos.id] ? "Resolving..." : "Resolve"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {resolvedSOS.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Resolved Incidents</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Resident</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Resolved At</th>
                </tr>
              </thead>
              <tbody>
                {resolvedSOS.map((sos) => (
                  <tr key={sos.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">SOS-{sos.id}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{sos.category?.name || "-"}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{sos.resident?.email || "-"}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(sos.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
