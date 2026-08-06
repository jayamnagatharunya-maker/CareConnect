import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { emergencyApi } from "../services/api";

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone_number: "", email: "", relation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const res = await emergencyApi.contacts();
      setContacts(res.data.results || res.data);
      setError("");
    } catch {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    if (editingId) {
      await emergencyApi.updateContact(editingId, form);
    } else {
      await emergencyApi.createContact(form);
    }

    setForm({
      name: "",
      phone_number: "",
      email: "",
      relation: "",
    });

    setEditingId(null);
    setError("");

    await load();
  } catch {
    setError(
      editingId
        ? "Failed to update contact"
        : "Failed to create contact"
    );
  } finally {
    setSubmitting(false);
  }
};
  const handleEdit = (contact) => {
  setEditingId(contact.id);

  setForm({
    name: contact.name || "",
    phone_number: contact.phone_number || "",
    email: contact.email || "",
    relation: contact.relation || "",
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const handleDelete = async (id) => {
  if (!window.confirm("Delete this contact?")) return;

  try {
    await emergencyApi.deleteContact(id);
    await load();

    if (editingId === id) {
      setEditingId(null);

      setForm({
        name: "",
        phone_number: "",
        email: "",
        relation: "",
      });
    }
  } catch {
    setError("Failed to delete contact");
  }
};
  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{editingId ? "Edit Contact" : "Add Contact"}</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    placeholder="Contact name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    placeholder="Phone number"
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Relation</label>
                  <input
                    className="input"
                    placeholder="Relation"
                    value={form.relation}
                    onChange={(e) => setForm({ ...form, relation: e.target.value })}
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
      : "Adding..."
    : editingId
    ? "Update Contact"
    : "Add Contact"}
</button>
{editingId && (
  <button
    type="button"
    className="btn btn-secondary w-full mt-2"
    onClick={() => {
      setEditingId(null);
      setForm({
        name: "",
        phone_number: "",
        email: "",
        relation: "",
      });
    }}
  >
    Cancel
  </button>
)}
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contacts</h3>
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No emergency contacts</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
  <tr className="border-b border-slate-200">
    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
      Name
    </th>

    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
      Phone
    </th>

    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
      Relation
    </th>

    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
      Status
    </th>

    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
      Actions
    </th>
  </tr>
</thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900 font-medium">{contact.name}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{contact.phone_number}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{contact.relation || "-"}</td>
                          
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
