import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-10 text-stone-400">
        Loading rankings...
      </div>
    );

  const topRankStyle = "bg-amber-100 text-amber-800 border border-amber-300";
  const neutralRankStyle = "bg-stone-100 text-stone-500 border border-stone-200";

  return (
    <div>
      <div className="space-y-2">
        <div className="flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <span className="w-9 shrink-0">#</span>
          <span className="flex-1">Player</span>
          <span>ELO</span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">
            No players registered yet.
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
                index === 0
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white/50 border-stone-200 hover:bg-white/80"
              }`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-xs font-bold ${
                  index === 0 ? topRankStyle : neutralRankStyle
                }`}
              >
                {index + 1}
              </span>
              <span className="flex-1 font-medium text-stone-800 truncate">
                {user.username}
              </span>
              <span className="shrink-0 px-3 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono font-semibold text-sm border border-stone-200">
                {user.elo}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
