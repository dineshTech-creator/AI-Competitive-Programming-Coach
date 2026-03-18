import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboard, getAIAnalysis, getAIRecommendation } from "../services/api";
import StatCard from "../components/StatCard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await getDashboard();
        setData(resp);
      } catch (err) {
        setError("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const progressSeries = useMemo(() => data?.progress || [], [data]);

  const handleAnalysis = async () => {
    try {
      const resp = await getAIAnalysis();
      setAnalysis(resp.analysis);
    } catch (err) {
      setAnalysis("Unable to fetch analysis at this time.");
    }
  };

  const handleRecommendation = async () => {
    try {
      const resp = await getAIRecommendation();
      setRecommendation(resp.recommendation);
    } catch (err) {
      setRecommendation("Unable to fetch recommendation at this time.");
    }
  };

  if (loading) {
    return <div className="text-center text-muted">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted">Your performance snapshot and quick actions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAnalysis}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
          >
            Get AI analysis
          </button>
          <button
            onClick={handleRecommendation}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90"
          >
            Get plan
          </button>
        </div>
      </header>

      {error && <div className="rounded-lg bg-red-500/20 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Problems Solved" value={data?.stats?.totalSolved || 0} />
        <StatCard title="Accuracy" value={`${data?.stats?.accuracy || 0}%`} />
        <StatCard title="Avg Time" value={`${data?.stats?.avgTime || 0} min`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase">Strengths</h3>
          <div className="mt-3 space-y-2">
            {data?.stats?.strength?.length ? (
              data.stats.strength.map((topic) => (
                <div
                  key={topic}
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white"
                >
                  {topic}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted">No clear strengths yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase">Weaknesses</h3>
          <div className="mt-3 space-y-2">
            {data?.stats?.weakness?.length ? (
              data.stats.weakness.map((topic) => (
                <div
                  key={topic}
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white"
                >
                  {topic}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted">No clear weaknesses yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase">Progress (last 14 days)</h3>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressSeries} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5FB4A2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#5FB4A2" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C3C5A" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A3B3C6" }} />
                <YAxis tick={{ fontSize: 11, fill: "#A3B3C6" }} />
                <Tooltip contentStyle={{ background: "#0C1222", borderColor: "#23304c" }} />
                <Area type="monotone" dataKey="count" stroke="#5FB4A2" fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase">AI analysis</h3>
          <div className="mt-4 min-h-[160px] whitespace-pre-wrap text-sm text-white/80">
            {analysis || "Click \"Get AI analysis\" to view personalized insights."}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase">Recommended practice plan</h3>
          <div className="mt-4 min-h-[160px] whitespace-pre-wrap text-sm text-white/80">
            {recommendation || "Click \"Get plan\" to generate a daily practice plan backed by AI."}
          </div>
        </div>
      </div>
    </div>
  );
}
