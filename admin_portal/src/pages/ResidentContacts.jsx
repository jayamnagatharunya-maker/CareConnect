import { useState, useEffect } from "react";
import { emergencyApi } from "../services/api";

export default function ResidentContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await emergencyApi.contacts();
      setContacts(res.data.results || res.data);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Emergency Contacts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your saved emergency contacts.
        </p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No emergency contacts found.
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                  Relation
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {contact.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {contact.phone_number}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {contact.email || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {contact.relation || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {contact.verification_status || "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
