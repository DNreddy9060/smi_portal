import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'partner', name: 'Partner User' },
        emailRedirectTo: 'https://smi-portal.vercel.app'
      }
    })
    setLoading(false)
    if (error) setMessage('❌ ' + error.message)
    else setMessage('✅ Account created! You can now log in.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center text-blue-700">
          Partner Signup
        </h1>
        <input
          type="email"
          className="border p-2 w-full mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border p-2 w-full mb-4 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        {message && (
          <p className="text-center mt-3 text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  )
}
