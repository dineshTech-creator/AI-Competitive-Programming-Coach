import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState("points");
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await getLeaderboard(sortBy);
      setRows(res.leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Leaderboard</h2>
          <p className="text-sm text-muted">See who is leading in problems solved and points.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="points">Points</option>
            <option value="solved">Problems solved</option>
          </select>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
        {loading ? (
          <div className="text-sm text-muted">Loading leaderboard...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted uppercase">
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Points</th>
                  <th className="py-3 pr-4">Solved</th>
                  <th className="py-3 pr-4">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-white/5">
                    <td className="py-3 pr-4 font-semibold">{idx + 1}</td>
                    <td className="py-3 pr-4">{row.name}</td>
                    <td className="py-3 pr-4">{row.points}</td>
                    <td className="py-3 pr-4">{row.solved}</td>
                    <td className="py-3 pr-4">
                      {row.badges?.slice(0, 3).map((badge) => (
                        <span
                          key={badge.key}
                          className="mr-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80"
                        >
                          {badge.name}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
