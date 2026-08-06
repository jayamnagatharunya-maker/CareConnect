import { useState, useEffect } from "react";
import { societyApi } from "../services/api";

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [form, setForm] = useState({
    society: "",
    name: "",
    code: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [blocksRes, societiesRes] = await Promise.all([
        societyApi.blocks(),
        societyApi.list(),
      ]);
      setBlocks(blocksRes.data.results || blocksRes.data);
      setSocieties(societiesRes.data.results || societiesRes.data);
      setError("");
    } catch {
      setError("Failed to load blocks");
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
        society: Number(form.society),
        name: form.name,
        code: form.code,
      };

      if (editingId) {
        await societyApi.updateBlock(editingId, payload);
      } else {
        await societyApi.createBlock(payload);
      }

      setForm({
        society: "",
        name: "",
        code: "",
      });

      setEditingId(null);
      await load();
      setError("");
    } catch {
      setError(
        editingId
          ? "Failed to update block"
          : "Failed to create block"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this block?")) return;

    try {
      await societyApi.deleteBlock(id);
      await load();
    } catch {
      alert("Failed to delete block");
    }
  };

  const handleEdit = (block) => {
    setEditingId(block.id);

    setForm({
      society: String(block.society),
      name: block.name,
      code: block.code,
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
              {editingId ? "Edit Block" : "Create Block"}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Society</label>
                <select
                  className="input"
                  value={form.society}
                  onChange={(e) =>
                    setForm({ ...form, society: e.target.value })
                  }
                  required
                >
                  <option value="">Select society</option>
                  {societies.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Block Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Block Code</label>
                <input
                  className="input"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value })
                  }
                  required
                />
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
                  ? "Update Block"
                  : "Create Block"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      society: "",
                      name: "",
                      code: "",
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
              Blocks List
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Loading...
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No blocks found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4">Society</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Code</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {blocks.map((block) => (
                      <tr
                        key={block.id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 px-4">{block.society_name || block.society}</td>
                        <td className="py-3 px-4">{block.name}</td>
                        <td className="py-3 px-4">{block.code}</td>

                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-secondary text-sm"
                              onClick={() => handleEdit(block)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger text-sm"
                              onClick={() => handleDelete(block.id)}
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
