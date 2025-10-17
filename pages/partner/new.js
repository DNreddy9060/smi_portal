import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function NewCut() {
  const router = useRouter();
  const [form, setForm] = useState({
    district: "",
    mandal: "",
    location_name: "",
    issue_type: "",
  });
  const [file, setFile] = useState(null);
  const [gps, setGps] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 📍 Get current GPS location
  const getLocation = () => {
    if (!navigator.geolocation)
      return alert("GPS not supported on this device");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        setGps(coords);
      },
      (err) => alert("Failed to get location: " + err.message)
    );
  };

  // 📤 Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return setMessage("Not logged in.");

    // upload photo if provided
    let photo_url = null;
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from("cut-photos")
        .upload(fileName, file);

      if (uploadError) {
        setMessage("❌ Upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicUrl } = supabase.storage
        .from("cut-photos")
        .getPublicUrl(fileName);
      photo_url = publicUrl.publicUrl;
    }

    // insert record into cuts
    const complaint_id = "CUT-" + Date.now();
    const { error } = await supabase.from("cuts").insert([
      {
        complaint_id,
        partner_id: user.id,
        district: form.district,
        mandal: form.mandal,
        location_name: form.location_name,
        issue_type: form.issue_type,
        gps_location: gps,
        photo_url,
        status: "OPEN",
      },
    ]);

    setLoading(false);
    if (error) setMessage("❌ " + error.message);
    else {
      setMessage("✅ Ticket raised successfully!");
      setTimeout(() => router.push("/partner"), 1500);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Raise New Fiber Cut</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow-md w-full max-w-md"
      >
        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="District"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Mandal"
          value={form.mandal}
          onChange={(e) => setForm({ ...form, mandal: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Location Name"
          value={form.location_name}
          onChange={(e) =>
            setForm({ ...form, location_name: e.target.value })
          }
          required
        />
        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Issue Type"
          value={form.issue_type}
          onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
          required
        />

        <div className="mb-2">
          <button
            type="button"
            onClick={getLocation}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            📍 Get GPS
          </button>
          {gps && <p className="text-xs text-gray-600 mt-1">{gps}</p>}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>

        {message && <p className="text-center mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}
