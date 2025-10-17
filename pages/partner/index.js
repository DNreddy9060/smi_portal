import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function PartnerDashboard() {
  const [cuts, setCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCuts();
  }, []);

  async function loadCuts() {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setMessage("⚠️ Please log in first");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("cuts")
      .select("*")
      .eq("partner_id", user.id)
      .order("id", { ascending: false });

    if (error) setMessage("❌ Error loading tickets: " + error.message);
    else setCuts(data || []);
    setLoading(false);
  }

  function getStatusColor(status) {
    const s = status?.toLowerCase();
    if (s === "open") return "bg-green-100 text-green-700";
    if (s === "assigned") return "bg-orange-100 text-orange-700";
    if (s === "pending") return "bg-blue-100 text-blue-700";
    if (s === "closed") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-500";
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">My Fiber Cut Tickets</h1>
        <button
          onClick={loadCuts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : cuts.length === 0 ? (
        <p className="text-center text-gray-500">
          No tickets found. <br />
          <a href="/partner/new" className="text-blue-600 underline">
            Raise a new ticket
          </a>
        </p>
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
                <th className="p-2">Photo</th>
                <th className="p-2">GPS</th>
              </tr>
            </thead>
            <tbody>
              {cuts.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{row.complaint_id}</td>
                  <td className="p-2">{row.district}</td>
                  <td className="p-2">{row.mandal}</td>
                  <td className="p-2">{row.location_name}</td>
                  <td className="p-2">{row.issue_type}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        row.status
                      )}`}
                    >
                      {row.status || "—"}
                    </span>
                  </td>
                  <td className="p-2">
                    {row.photo_url ? (
                      <a
                        href={row.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2">
                    {row.gps_location ? (
                      <a
                        href={`https://www.google.com/maps?q=${row.gps_location}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Map
                      </a>
                    ) : (
                      "-"
                    )}
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
