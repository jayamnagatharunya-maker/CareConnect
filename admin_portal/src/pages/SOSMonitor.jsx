import { useEffect, useMemo, useState } from "react";
import { sosApi } from "../services/api";

export default function SOSMonitor() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sosList, setSosList] = useState([]);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchSOS();
  }, []);

  const fetchSOS = async () => {
    try {
      const res = await sosApi.list();
      setSosList(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch SOS:", err);
      alert("Unable to load SOS records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSOSDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await sosApi.detail(id);
      setSelectedSOS(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch SOS detail:", err);
      alert("Unable to load SOS details. Please try again.");
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await sosApi.updateStatus(id, newStatus);
      await fetchSOS();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update SOS status. Please try again.");
    }
  };
  const filteredSOS = useMemo(() => {
    return sosList.filter((item) => {
      const matchesSearch =
        (item.resident?.email || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (item.address || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [sosList, search, status]);

  const active = sosList.filter(
  (x) =>
    x.status === "pending" ||
    x.status === "acknowledged"
).length;

const pending = sosList.filter(
  (x) => x.status === "pending"
).length;

const resolved = sosList.filter(
  (x) => x.status === "resolved"
).length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">SOS Monitor</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-600">Active SOS</h2>
          <p className="text-3xl font-bold text-red-600">{active}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-600">Pending</h2>
          <p className="text-3xl font-bold text-yellow-600">{pending}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-600">Resolved</h2>
          <p className="text-3xl font-bold text-green-600">{resolved}</p>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-600">Total SOS</h2>
          <p className="text-3xl font-bold text-blue-600">
            {sosList.length}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search Resident..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-72"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Resident</th>
              <th className="p-3">Category</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Time</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  Loading SOS monitor...
                </td>
              </tr>
            ) : filteredSOS.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  No SOS records found.
                </td>
              </tr>
            ) : (
              filteredSOS.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">SOS-{item.id}</td>

                  <td className="p-3">
                    {item.resident?.email || "Unknown"}
                  </td>

                  <td className="p-3">
                    {item.category?.name || "-"}
                  </td>

                  <td className="p-3">
                    {item.address || "-"}
                  </td>

                  <td className="p-3">
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

                  <td className="p-3">
                    {new Date(item.created_at).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <button
  onClick={() => fetchSOSDetail(item.id)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
>
  View
</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && selectedSOS && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-[600px] p-6">

      <h2 className="text-2xl font-bold mb-6">
        SOS Details
      </h2>

      <div className="space-y-3">

        <p>
          <strong>Resident:</strong>{" "}
          {selectedSOS.resident?.email}
        </p>

        <p>
          <strong>Category:</strong>{" "}
          {selectedSOS.category?.name}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {selectedSOS.status}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {selectedSOS.address || "Not Available"}
        </p>

        <p>
          <strong>Message:</strong>{" "}
          {selectedSOS.message || "No message"}
        </p>

        <p>
          <strong>Latitude:</strong>{" "}
          {selectedSOS.latitude}
        </p>

        <p>
          <strong>Longitude:</strong>{" "}
          {selectedSOS.longitude}
        </p>
<div className="mt-4">
  <a
    href={`https://www.google.com/maps?q=${selectedSOS.latitude},${selectedSOS.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"
  >
    📍 Open in Google Maps
  </a>
</div>
      </div>

      <div className="flex justify-end gap-3 mt-6">

  {selectedSOS.status === "pending" && (
  <button
    onClick={() => updateStatus(selectedSOS.id, "acknowledged")}
    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
  >
    Acknowledge
  </button>
)}

{selectedSOS.status === "acknowledged" && (
  <button
    onClick={() => updateStatus(selectedSOS.id, "resolved")}
    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
  >
    Resolve
  </button>
)}

  <button
    onClick={() => setShowModal(false)}
    className="px-4 py-2 bg-gray-500 text-white rounded-lg"
  >
    Close
  </button>

</div>

    </div>
  </div>
)}
    </div>
  );
}