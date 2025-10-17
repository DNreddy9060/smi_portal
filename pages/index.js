import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError(error.message)

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single()

    const role = userData?.role || ''
    if (role === 'partner') router.push('/partner')
    else router.push('/smi')
  }

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-6 rounded-2xl shadow-md w-80">
      <h1 className="text-xl font-bold text-center mb-4">SMI Fiber Cut Portal</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  </div>
)
}