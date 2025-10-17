import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'





export default function PartnerPortal() {
  const [cuts, setCuts] = useState([])

  useEffect(()=>{ loadMyCuts() },[])

  async function loadMyCuts(){
    const user = (await supabase.auth.getUser()).data.user
    const { data } = await supabase.from('cuts').select('*').eq('partner_id', user.id)
    setCuts(data || [])
  }

  return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold mb-4">Partner Portal</h1>

    <a
      href="/partner/new"
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Raise New Cut
    </a>

    <table className="w-full mt-4 bg-white rounded-xl shadow">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">Complaint ID</th>
          <th className="p-2 text-left">District</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {cuts.map((c) => (
          <tr key={c.id} className="border-t">
            <td className="p-2">{c.complaint_id}</td>
            <td className="p-2">{c.district}</td>
            <td className="p-2">{c.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

}
