import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SmiDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ open: 0, assigned: 0, pending: 0, closed: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();

    // subscribe for realtime updates
    const channel = supabase
      .channel("cuts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cuts" }, () => loadData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [filter]);

  async function loadData() {
    setLoading(true);
    let query = supabase.from("cuts").select("*").order("id", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query;
    if (error) {
      setMessage("❌ " + error.message);
      setLoading(false);
      return;
    }

    const counters = { open: 0, assigned: 0, pending: 0, closed: 0 };
    data.forEach((row) => {
      const s = (row.status || "").toLowerCase();
      if (s === "open") counters.open++;
      else if (s === "assigned") counters.assigned++;
      else if (s === "pending") counters.pending++;
      else if (s === "closed") counters.closed++;
    });

    setTickets(data);
    setStats(counters);
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from("cuts").update({ status: newStatus }).eq("id", id);
    if (error) alert("Failed to update status: " + error.message);
  }

  const badge = (status) => {
    const s = status?.toLowerCase();
    if (s === "open") return "bg-green-100 text-green-700";
    if (s === "assigned") return "bg-orange-100 text-orange-700";
    if (s === "pending") return "bg-blue-100 text-blue-700";
    if (s === "closed") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">SMI Dashboard</h1>
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-200 p-4 rounded-xl text-center shadow">
          <b>Open</b><p className="text-2xl">{stats.open}</p>
        </div>
        <div className="bg-orange-200 p-4 rounded-xl text-center shadow">
          <b>Assigned</b><p className="text-2xl">{stats.assigned}</p>
        </div>
        <div className="bg-blue-200 p-4 rounded-xl text-center shadow">
          <b>Pending</b><p className="text-2xl">{stats.pending}</p>
        </div>
        <div className="bg-gray-300 p-4 rounded-xl text-center shadow">
          <b>Closed</b><p className="text-2xl">{stats.closed}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-2">Complaint ID</th>
                <th className="p-2">District</th>
                <th className="p-2">Mandal</th>
                <th className="p-2">Location</th>
                <th className="p-2">Issue Type</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{row.complaint_id}</td>
                  <td className="p-2">{row.district}</td>
                  <td className="p-2">{row.mandal}</td>
                  <td className="p-2">{row.location_name}</td>
                  <td className="p-2">{row.issue_type}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${badge(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-2 text-center space-x-1">
                    <button
                      onClick={() => updateStatus(row.id, "ASSIGNED")}
                      className="bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => updateStatus(row.id, "PENDING")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateStatus(row.id, "CLOSED")}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && <p className="text-center text-red-600 mt-4">{message}</p>}
    </div>
  );
}
