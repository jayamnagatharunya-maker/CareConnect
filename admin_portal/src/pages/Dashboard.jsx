import { useEffect, useState } from "react";
import { authApi, dashboardApi, sosApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  const [summary, setSummary] = useState({
  total_sos: 0,
  active_sos: 0,
  pending_sos: 0,
  resolved_sos: 0,
  resolved_today: 0,
  pending_guardian: 0,
  acknowledged_sos: 0,
  cancelled_sos: 0,
  escalated: 0,
  volunteers_responding: 0,
  average_response_time_minutes: null,
  category_counts: [],
  daily_counts: [],
});
  const [notificationAnalytics, setNotificationAnalytics] = useState({
    sent: 0,
    delivered: 0,
    failed: 0,
    delivery_rate: 0,
  });
  const [latestSOS, setLatestSOS] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [res, sosRes, notifAnalytics] = await Promise.all([
        dashboardApi.summary(),
        sosApi.list(),
        dashboardApi.notificationAnalytics(),
      ]);
      setSummary({
  total_sos: 0,
  active_sos: 0,
  pending_sos: 0,
  resolved_sos: 0,
  resolved_today: 0,
  pending_guardian: 0,
  acknowledged_sos: 0,
  cancelled_sos: 0,
  escalated: 0,
  volunteers_responding: 0,
  average_response_time_minutes: null,
  category_counts: [],
  daily_counts: [],
  ...res.data,
});
      setNotificationAnalytics(notifAnalytics.data || {
        sent: 0,
        delivered: 0,
        failed: 0,
        delivery_rate: 0,
      });
      const latest = (sosRes.data || [])
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setLatestSOS(latest);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  const stats = summary
    ? [
        {
          label: "Active SOS",
          value: summary.active_sos ?? 0,
          icon: "🆘",
          color: "bg-red-500",
        },
        {
          label: "Resolved Today",
          value: summary.resolved_today,
          icon: "✅",
          color: "bg-green-500",
        },
        {
          label: "Pending Guardian",
          value: summary.pending_guardian,
          icon: "⏳",
          color: "bg-yellow-500",
        },
        {
          label: "Escalated",
          value: summary.escalated,
          icon: "⏫",
          color: "bg-indigo-500",
        },
        {
          label: "Volunteers Responding",
          value: summary.volunteers_responding,
          icon: "🚑",
          color: "bg-sky-500",
        },
        {
          label: "Avg Response (min)",
          value:
            summary.average_response_time_minutes !== null
              ? summary.average_response_time_minutes.toFixed(1)
              : "N/A",
          icon: "⏱️",
          color: "bg-fuchsia-500",
        },
      ]
    : [];

  const maxCategoryCount = summary?.category_counts?.reduce(
    (max, item) => Math.max(max, item.count),
    0
  );

  const maxDailyCount = summary?.daily_counts?.reduce(
    (max, item) => Math.max(max, item.count),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live SOS metrics, escalations, and response analytics.
            {lastUpdated && (
              <span className="block mt-2 text-xs text-slate-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => loadDashboard({ showLoader: true })}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className={`${stat.color} flex h-14 w-14 items-center justify-center rounded-3xl text-white text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Notification Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Sent</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{notificationAnalytics.sent}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Delivered</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{notificationAnalytics.delivered}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Failed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{notificationAnalytics.failed}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span>Delivery Rate: <strong>{notificationAnalytics.delivery_rate}%</strong></span>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">SOS by Category</h2>
              <p className="text-sm text-slate-500">Incident distribution across categories.</p>
            </div>
          </div>
          {loading ? (
            <div className="text-slate-500">Loading chart...</div>
          ) : summary?.category_counts?.length ? (
            <div className="space-y-4">
              {summary.category_counts.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                    <span>{item.category}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-sky-600"
                      style={{ width: `${Math.round((item.count / (maxCategoryCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500">No category data available.</div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">SOS by Day</h2>
              <p className="text-sm text-slate-500">Last 7 days of SOS volume.</p>
            </div>
          </div>
          {loading ? (
            <div className="text-slate-500">Loading chart...</div>
          ) : summary?.daily_counts?.length ? (
            <div className="space-y-4">
              {summary.daily_counts.map((item) => (
                <div key={item.day}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                    <span>{item.day}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-emerald-500"
                      style={{ width: `${Math.round((item.count / (maxDailyCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500">No daily data available.</div>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Latest SOS Activity</h2>
        {loading ? (
          <div className="text-slate-500">Loading latest SOS...</div>
        ) : latestSOS.length ? (
          <div className="space-y-4">
            {latestSOS.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">SOS-{item.id}</p>
                    <p className="text-base font-semibold text-slate-900">
                      {item.category?.name || "Unknown category"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {item.status}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  <p>
                    <strong>Resident:</strong> {item.resident?.email || "Unknown"}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {item.address || "No address provided"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500">No recent SOS activity found.</div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Response & Escalation Summary</h2>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Average Response Time</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
  {summary?.average_response_time_minutes != null
    ? `${Number(summary.average_response_time_minutes).toFixed(1)} min`
    : "N/A"}
</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Escalated Incidents</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.escalated ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Volunteers Responding</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.volunteers_responding ?? 0}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Metrics</h2>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total SOS</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.total_sos ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Acknowledged SOS</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.acknowledged_sos ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Cancelled SOS</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.cancelled_sos ?? 0}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
