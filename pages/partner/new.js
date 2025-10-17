import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'




import { useRouter } from 'next/router'

export default function NewCut() {
  const router = useRouter()
  const [form, setForm] = useState({ district:'', mandal:'', location_name:'', issue_type:'' })

  const handleSubmit = async (e)=>{
    e.preventDefault()
    const user = (await supabase.auth.getUser()).data.user
    const complaint_id = `CUT-${Date.now()}`
    await supabase.from('cuts').insert([{ complaint_id, partner_id:user.id, ...form, status:'OPEN' }])
    router.push('/partner')
  }

  return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold mb-4">Raise New Fiber Cut</h1>

    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md max-w-md">
      <label>District</label>
      <input
        className="w-full border p-2 mb-2"
        value={form.district}
        onChange={(e) => setForm({ ...form, district: e.target.value })}
        required
      />

      <label>Mandal</label>
      <input
        className="w-full border p-2 mb-2"
        value={form.mandal}
        onChange={(e) => setForm({ ...form, mandal: e.target.value })}
        required
      />

      <label>Location Name</label>
      <input
        className="w-full border p-2 mb-2"
        value={form.location_name}
        onChange={(e) => setForm({ ...form, location_name: e.target.value })}
        required
      />

      <label>Issue Type</label>
      <input
        className="w-full border p-2 mb-4"
        value={form.issue_type}
        onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
        required
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  </div>
)

}
