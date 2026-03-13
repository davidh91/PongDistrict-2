import { useState } from 'react'
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password_repeat: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (formData.password !== formData.password_repeat) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Registration failed')
      }
      setSuccess(true)
      setTimeout(() => onSwitchToLogin(), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-sm mx-auto text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-stone-900 mb-1">Account Created!</h2>
        <p className="text-stone-500 text-sm">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-7">
        <h2 className="text-xl font-semibold text-stone-900 mb-1">Create account</h2>
        <p className="text-stone-500 text-sm">Join PongDistrict to start competing</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Username</label>
          <input type="text" name="username" required value={formData.username} onChange={handleChange}
            className="w-full bg-white border border-stone-300 rounded-lg py-2 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors text-sm"
            placeholder="pongmaster" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange}
            className="w-full bg-white border border-stone-300 rounded-lg py-2 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors text-sm"
            placeholder="player@example.com" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-stone-700">Password</label>
            <span className="text-[10px] text-stone-400">&gt;8 chars, 1 special char</span>
          </div>
          <input type="password" name="password" required value={formData.password} onChange={handleChange}
            className="w-full bg-white border border-stone-300 rounded-lg py-2 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors text-sm"
            placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Repeat Password</label>
          <input type="password" name="password_repeat" required value={formData.password_repeat} onChange={handleChange}
            className="w-full bg-white border border-stone-300 rounded-lg py-2 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors text-sm"
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-[#EFE4D2] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm mt-2">
          <UserPlus className="w-4 h-4" />
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-stone-800 font-medium hover:underline">Sign in</button>
      </p>
    </div>
  )
}
