import { useEffect, useState } from "react";
import { History } from "lucide-react";

export default function MatchList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/matches`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch matches:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-10 text-stone-400">Loading history...</div>
    );

  return (
    <div>
      <div className="space-y-2">
        {matches.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">
            No matches recorded yet.
          </div>
        ) : (
          matches.map((match) => {
            const date = new Date(match.timestamp).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const winnerGain = match.winner_elo_after - match.winner_elo_before;
            const loserLoss = match.loser_elo_before - match.loser_elo_after;

            return (
              <div
                key={match.id}
                className="bg-white/50 border border-stone-200 rounded-xl p-4 hover:bg-white/80 transition-colors"
              >
                <div className="text-xs text-stone-400 mb-2">{date}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-800 truncate flex items-center gap-1">
                      <span>👑</span>
                      <span className="truncate">{match.winner.username}</span>
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">
                      {match.winner_elo_before}{" "}
                      <span className="text-green-700">+{winnerGain}</span> →{" "}
                      {match.winner_elo_after}
                    </div>
                  </div>
                  <div className="shrink-0 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    vs
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-medium text-stone-600 truncate">
                      {match.loser.username}
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">
                      {match.loser_elo_before}{" "}
                      <span className="text-red-600">-{loserLoss}</span> →{" "}
                      {match.loser_elo_after}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
