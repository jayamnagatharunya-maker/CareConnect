import { useState, useEffect } from "react";
import { notificationsApi } from "../services/api";

export default function VolunteerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.results || res.data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      await load();
    } catch {
      alert("Unable to mark notification as read. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">Your alerts and updates.</p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between p-4 rounded-lg border ${
                n.is_read ? "bg-slate-50 border-slate-200" : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                </div>
                <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(n.sent_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => handleMarkRead(n.id)} className="btn btn-primary text-sm ml-4">
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
