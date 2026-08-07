import { useEffect, useState } from "react";
import { sosApi } from "../services/api";

export default function ResidentSOS() {
  const [sosList, setSosList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    category: "",
    message: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  const loadData = async () => {
    try {
      const [sosRes, catRes] = await Promise.all([
        sosApi.list(),
        sosApi.categories(),
      ]);
      setSosList(sosRes.data.results || sosRes.data);
      setCategories(catRes.data.results || catRes.data);
    } catch (err) {
      console.error("Failed to load SOS data:", err);
      alert("Unable to load SOS data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sosApi.create({
        category: Number(form.category),
        message: form.message,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        address: form.address,
      });
      setForm({ category: "", message: "", latitude: "", longitude: "", address: "" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create SOS:", err);
      alert("Unable to raise SOS. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = sosList.filter(
    (s) => s.status === "pending" || s.status === "acknowledged"
  ).length;
  const resolvedCount = sosList.filter((s) => s.status === "resolved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SOS Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Raise and track your emergency requests.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          {showForm ? "Cancel" : "+ Raise SOS"}
        </button>
      </div>

      {showForm && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Raise New SOS</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Latitude</label>
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Submitting..." : "Submit SOS"}
            </button>
          </form>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active SOS</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{activeCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Resolved</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{resolvedCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{sosList.length}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">SOS History</h2>
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading SOS history...</div>
      ) : sosList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No SOS records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Address
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {sosList.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-sm text-slate-900">
                      SOS-{item.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {item.category?.name || "-"}
                    </td>
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
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {item.address || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(item.created_at).toLocaleString()}
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
