import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/sos-monitor", label: "SOS Monitor", icon: "🚨" },
  { path: "/societies", label: "Societies", icon: "🏘️" },
  { path: "/blocks", label: "Blocks", icon: "🏢" },
  { path: "/flats", label: "Flats", icon: "🏠" },
  { path: "/residents", label: "Residents", icon: "👥" },
  { path: "/emergency-contacts", label: "Emergency Contacts", icon: "🆘" },
  { path: "/notifications", label: "Notifications", icon: "🔔" },
  { path: "/escalation", label: "Escalation", icon: "⏫" },
];
export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">CareConnect</h1>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {navItems.find((item) => isActive(item.path))?.label ||
                  "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Admin</span>

              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                A
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}