import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authApi, sosApi } from "../services/api";

export default function ResidentDashboard() {
  const [user, setUser] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [userRes, sosRes] = await Promise.all([
        authApi.me(),
        sosApi.list(),
      ]);
      setUser(userRes.data);
      setSosList(sosRes.data.results || sosRes.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    { label: "Total SOS", value: sosList.length, icon: "📋", color: "bg-slate-500" },
    {
      label: "Active SOS",
      value: sosList.filter((s) => s.status === "pending" || s.status === "acknowledged").length,
      icon: "🚨",
      color: "bg-red-500",
    },
    {
      label: "Resolved",
      value: sosList.filter((s) => s.status === "resolved").length,
      icon: "✅",
      color: "bg-green-500",
    },
    {
      label: "Pending",
      value: sosList.filter((s) => s.status === "pending").length,
      icon: "⏳",
      color: "bg-yellow-500",
    },
  ];

  const latestSOS = [...sosList]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is your emergency response overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
              </div>
              <div
                className={`${stat.color} flex h-14 w-14 items-center justify-center rounded-3xl text-white text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">My Recent SOS Activity</h2>
          <Link
            to="/resident/sos/history"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        {latestSOS.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No SOS activity yet.</div>
        ) : (
          <div className="space-y-4">
            {latestSOS.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">SOS-{item.id}</p>
                    <p className="text-base font-semibold text-slate-900">
                      {item.category?.name || "Unknown category"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      item.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {item.address || "No address provided"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
