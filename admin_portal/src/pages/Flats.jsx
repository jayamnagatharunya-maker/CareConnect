import { useState, useEffect } from "react";
import { societyApi } from "../services/api";

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState({
    block: "",
    flat_number: "",
    floor: "",
    is_available: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [flatsRes, blocksRes] = await Promise.all([
        societyApi.flats(),
        societyApi.blocks(),
      ]);
      setFlats(flatsRes.data.results || flatsRes.data);
      setBlocks(blocksRes.data.results || blocksRes.data);
      setError("");
    } catch {
      setError("Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        block: Number(form.block),
        flat_number: form.flat_number,
        floor: Number(form.floor),
        is_available: form.is_available,
      };

      if (editingId) {
        await societyApi.updateFlat(editingId, payload);
      } else {
        await societyApi.createFlat(payload);
      }

      setForm({
        block: "",
        flat_number: "",
        floor: "",
        is_available: true,
      });

      setEditingId(null);
      await load();
      setError("");
    } catch {
      setError(
        editingId
          ? "Failed to update flat"
          : "Failed to create flat"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flat?")) return;

    try {
      await societyApi.deleteFlat(id);
      await load();
    } catch {
      alert("Failed to delete flat");
    }
  };

  const handleEdit = (flat) => {
    setEditingId(flat.id);

    setForm({
      block: String(flat.block),
      flat_number: flat.flat_number,
      floor: String(flat.floor),
      is_available: flat.is_available,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? "Edit Flat" : "Create Flat"}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Block</label>
                <select
                  className="input"
                  value={form.block}
                  onChange={(e) =>
                    setForm({ ...form, block: e.target.value })
                  }
                  required
                >
                  <option value="">Select block</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Flat Number</label>
                <input
                  className="input"
                  value={form.flat_number}
                  onChange={(e) =>
                    setForm({ ...form, flat_number: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Floor</label>
                <input
                  className="input"
                  type="number"
                  value={form.floor}
                  onChange={(e) =>
                    setForm({ ...form, floor: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={form.is_available}
                  onChange={(e) =>
                    setForm({ ...form, is_available: e.target.checked })
                  }
                />
                <label htmlFor="is_available" className="label">
                  Available
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Flat"
                  : "Create Flat"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      block: "",
                      flat_number: "",
                      floor: "",
                      is_available: true,
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Flats List
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Loading...
              </div>
            ) : flats.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No flats found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4">Block</th>
                      <th className="text-left py-3 px-4">Flat Number</th>
                      <th className="text-left py-3 px-4">Floor</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {flats.map((flat) => (
                      <tr
                        key={flat.id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 px-4">{flat.block_name || flat.block}</td>
                        <td className="py-3 px-4">{flat.flat_number}</td>
                        <td className="py-3 px-4">{flat.floor}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              flat.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {flat.is_available ? "Available" : "Occupied"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-secondary text-sm"
                              onClick={() => handleEdit(flat)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger text-sm"
                              onClick={() => handleDelete(flat.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
