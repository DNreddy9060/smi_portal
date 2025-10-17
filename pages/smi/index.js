import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SMIDashboard() {
  const [stats, setStats] = useState({ open: 0, assigned: 0, pending: 0, closed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data, error } = await supabase.from('cuts').select('status')
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
    setLoading(false)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">SMI Dashboard</h1>

      {loading ? (
        <p className="text-gray-500 text-center">Loading data...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-200 p-4 rounded-xl text-center shadow">
            <b>Open</b>
            <p className="text-2xl font-semibold">{stats.open}</p>
          </div>
          <div className="bg-orange-200 p-4 rounded-xl text-center shadow">
            <b>Assigned</b>
            <p className="text-2xl font-semibold">{stats.assigned}</p>
          </div>
          <div className="bg-blue-200 p-4 rounded-xl text-center shadow">
            <b>Pending</b>
            <p className="text-2xl font-semibold">{stats.pending}</p>
          </div>
          <div className="bg-gray-300 p-4 rounded-xl text-center shadow">
            <b>Closed</b>
            <p className="text-2xl font-semibold">{stats.closed}</p>
          </div>
        </div>
      )}
    </div>
  )
}
