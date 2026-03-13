import { useState, useEffect } from 'react'
import { UserCheck, Swords } from 'lucide-react'

export default function AddMatch({ token, currentUser }) {
  const [users, setUsers] = useState([])
  const [opponentId, setOpponentId] = useState('')
  const [didIWin, setDidIWin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (currentUser) {
          setUsers(data.filter(u => u.id !== currentUser.id))
        }
      })
      .catch(err => console.error("Error fetching users:", err))
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!opponentId) return setError("Please select an opponent")
    setLoading(true)
    setError(null)
    setSuccess(false)

    const currentUserId = currentUser?.id
    const matchData = {
      winner_id: didIWin ? currentUserId : opponentId,
      loser_id: didIWin ? opponentId : currentUserId
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(matchData)
      })
      if (!res.ok) throw new Error("Failed to record match")
      setSuccess(true)
      setOpponentId('')
      setDidIWin(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Swords className="w-4 h-4 text-stone-500" />
        <h2 className="text-lg font-semibold text-stone-800">Log a Match</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
          ✓ Match recorded successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Opponent</label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <select
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg py-2 pl-9 pr-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors text-sm appearance-none"
            >
              <option value="" disabled>Select player...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Outcome</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setDidIWin(true)}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all border ${
                didIWin ? 'bg-green-50 border-green-400 text-green-800' : 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50'
              }`}>
              I Won 🏆
            </button>
            <button type="button" onClick={() => setDidIWin(false)}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all border ${
                !didIWin ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50'
              }`}>
              I Lost 💀
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading || !opponentId}
          className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-[#EFE4D2] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
          {loading ? 'Submitting...' : 'Submit Match Result'}
        </button>
      </form>
    </div>
  )
}
