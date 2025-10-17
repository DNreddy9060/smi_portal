import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'




export default function SmiDashboard() {
  const [stats, setStats] = useState({open:0, assigned:0, pending:0, closed:0})
  const [cuts, setCuts] = useState([])

  useEffect(()=>{ loadCuts() },[])

  async function loadCuts(){
    const { data } = await supabase.from('cuts').select('*')
    if (data) {
      const open = data.filter(c=>c.status==='OPEN').length
      const assigned = data.filter(c=>c.status==='ASSIGNED').length
      const pending = data.filter(c=>c.status==='PENDING_APPROVAL').length
      const closed = data.filter(c=>c.status==='CLOSED').length
      setStats({open,assigned,pending,closed})
      setCuts(data)
    }
  }

  return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold mb-4">SMI Dashboard</h1>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-200 p-4 rounded-xl text-center">
        <b>Open</b>
        <p>{stats.open}</p>
      </div>

      <div className="bg-orange-200 p-4 rounded-xl text-center">
        <b>Assigned</b>
        <p>{stats.assigned}</p>
      </div>

      <div className="bg-blue-200 p-4 rounded-xl text-center">
        <b>Pending</b>
        <p>{stats.pending}</p>
      </div>

      <div className="bg-gray-300 p-4 rounded-xl text-center">
        <b>Closed</b>
        <p>{stats.closed}</p>
      </div>
    </div>
  </div>
)
}
