import { useEffect, useState } from "react";
import { sosApi } from "../services/api";

export default function GuardianDashboard() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadSOS = async () => {
    try {
      const res = await sosApi.list();
      setSosList(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load SOS:", err);
      alert("Unable to load SOS alerts. Please check your connection and try again.");
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
      await sosApi.guardianResponse(id, "accept");
      await loadSOS();
    } catch (err) {
      console.error("Failed to accept SOS:", err);
      alert("Unable to accept SOS alert. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await sosApi.updateStatus(id, "cancelled");
      await loadSOS();
    } catch (err) {
      console.error("Failed to reject SOS:", err);
      alert("Unable to reject SOS alert. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const pendingSOS = sosList.filter(
    (s) => s.status === "pending" || s.status === "acknowledged"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading SOS alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Guardian Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor and respond to SOS alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending Alerts</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {sosList.filter((s) => s.status === "pending").length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Acknowledged</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {sosList.filter((s) => s.status === "acknowledged").length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Resolved</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {sosList.filter((s) => s.status === "resolved").length}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">SOS Alerts</h2>
        {pendingSOS.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No active SOS alerts.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSOS.map((sos) => (
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
                    <>
                      <a
                        href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
                      >
                        View Location
                      </a>
                      <button
                        onClick={() => handleAccept(sos.id)}
                        disabled={actionLoading[sos.id]}
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-green-400"
                      >
                        {actionLoading[sos.id] ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleReject(sos.id)}
                        disabled={actionLoading[sos.id]}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-red-400"
                      >
                        {actionLoading[sos.id] ? "Rejecting..." : "Reject"}
                      </button>
                    </>
                  )}
                  {sos.status === "acknowledged" && (
                    <a
                      href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
                    >
                      View Location
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
