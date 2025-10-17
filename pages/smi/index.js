import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SMIDashboard() {
  const [stats, setStats] = useState({ open: 0, assigned: 0, pending: 0, closed: 0 })
  const [cuts, setCuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadData()
    const subscription = supabase
      .channel('cuts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cuts' }, () => {
        loadData()
      })
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [])

  async function loadData() {
    setLoading(true)
    let query = supabase.from('cuts').select('*').order('id', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data, error } = await query
    if (error) {
      console.error('Error loading data:', error)
      setLoading(false)
      return
    }

    const counts = { open: 0, assigned: 0, pending: 0, closed: 0 }
    data.forEach(row => {
      const s = row.status?.toLowerCase()
      if (s === 'open') counts.open++
      else if (s === 'assigned') counts.assigned++
      else if (s === 'pending') counts.pending++
      else if (s === 'closed') counts.closed++
    })

    setStats(counts)
    setCuts(data)
    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }

  async function updateStatus(id, newStatus) {
    await supabase.from('cuts').update({ status: newStatus }).eq('id', id)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">SMI Dashboard</h1>
        <button
          onClick={loadData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Loading data...</p>
      ) : (
        <>
          {/* Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

          {/* Filter */}
          <div className="mb-4 flex justify-between items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">District</th>
                  <th className="p-2">Mandal</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Issue Type</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {cuts.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-100">
                    <td className="p-2">{row.id}</td>
                    <td className="p-2">{row.district}</td>
                    <td className="p-2">{row.mandal}</td>
                    <td className="p-2">{row.location_name}</td>
                    <td className="p-2">{row.issue_type}</td>
                    <td className="p-2 font-semibold">{row.status}</td>
                    <td className="p-2 text-center space-x-1">
                      <button onClick={() => updateStatus(row.id, 'Assigned')} className="bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded">Assign</button>
                      <button onClick={() => updateStatus(row.id, 'Closed')} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">Close</button>
                      <button onClick={() => updateStatus(row.id, 'Pending')} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">Pending</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
