import { useEffect, useState } from "react";
import {
  authApi,
  societyApi,
  usersApi,
  sosApi,
} from "../services/api";
import { useAuth } from "../context/AuthContext";


const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/sos-monitor", label: "SOS Monitor", icon: "🚨" },
  { path: "/societies", label: "Societies", icon: "🏘️" },
  { path: "/residents", label: "Residents", icon: "👥" },
  { path: "/emergency-contacts", label: "Emergency Contacts", icon: "🆘" },
  { path: "/notifications", label: "Notifications", icon: "🔔" },
  { path: "/escalation", label: "Escalation", icon: "⏫" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState([
  { label: "Total Societies", value: "0", icon: "🏘️", color: "bg-blue-500" },
  { label: "Residents", value: "0", icon: "👥", color: "bg-green-500" },
  { label: "Pending Approvals", value: "0", icon: "⏳", color: "bg-yellow-500" },
  { label: "Active SOS", value: "0", icon: "🆘", color: "bg-red-500" },
]);

useEffect(() => {
  const loadDashboard = async () => {
    try {
      const [societies, residents, pending, sos] = await Promise.all([
        societyApi.list(),
        usersApi.residentDirectory(),
        usersApi.pendingResidents(),
        sosApi.list(),
      ]);

      setStats([
        {
          label: "Total Societies",
          value: societies.data?.count ?? societies.data?.length ?? 0,
          icon: "🏘️",
          color: "bg-blue-500",
        },
        {
          label: "Residents",
          value: residents.data?.count ?? residents.data?.length ?? 0,
          icon: "👥",
          color: "bg-green-500",
        },
        {
          label: "Pending Approvals",
          value: pending.data?.count ?? pending.data?.length ?? 0,
          icon: "⏳",
          color: "bg-yellow-500",
        },
        {
          label: "Active SOS",
          value: sos.data?.count ?? sos.data?.length ?? 0,
          icon: "🆘",
          color: "bg-red-500",
        },
      ]);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    }
  };

  loadDashboard();
}, []);
  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-slate-900">New resident registration: John Doe</p>
                    <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Approvals</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Jane Smith</p>
                    <p className="text-xs text-slate-500">Flat 204, Block B</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}