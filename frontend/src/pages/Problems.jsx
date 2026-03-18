import { useEffect, useMemo, useState } from "react";
import { addProblem, listProblems } from "../services/api";
import StatCard from "../components/StatCard";

const difficulties = ["Easy", "Medium", "Hard"];
const topicOptions = ["Arrays", "Strings", "Graphs", "Dynamic Programming", "Trees", "Math", "Sorting", "Greedy"];
const languages = ["Python", "Java"]; // Supported languages with local execution

function Tag({ label }) {
  return <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">{label}</span>;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "Easy",
    topics: ["Arrays"],
    timeTakenMinutes: 10,
    attempts: 1,
    language: "Python",
    code: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const resp = await listProblems();
      setProblems(resp.problems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTopic = (topic) => {
    setForm((prev) => {
      const topics = prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic];
      return { ...prev, topics };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.code || !form.code.trim()) {
      setMessage({ type: "error", text: "Code is required to submit a solution." });
      return;
    }

    setSaving(true);
    setMessage(null);
    setSubmissionResult(null);
    try {
      const resp = await addProblem({
        ...form,
        timeTakenMinutes: Number(form.timeTakenMinutes),
        attempts: Number(form.attempts),
      });
      setMessage({ type: "success", text: "Problem submitted and evaluated!" });
      setSubmissionResult(resp.problem);
      setForm((prev) => ({ 
        ...prev, 
        name: "", 
        description: "",
        timeTakenMinutes: 10, 
        attempts: 1, 
        code: "",
        language: "Python",
      }));
      loadProblems();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = problems.length;
    const averageTime =
      total > 0 ? problems.reduce((sum, p) => sum + (p.timeTakenMinutes || 0), 0) / total : 0;
    const accuracy = total > 0 ? (problems.filter((p) => p.correct).length / total) * 100 : 0;
    return {
      total,
      averageTime: Math.round(averageTime * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
    };
  }, [problems]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Problem Tracker</h2>
          <p className="text-sm text-muted">Log what you solve and watch your stats improve.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Total logged" value={stats.total} />
        <StatCard title="Avg. time" value={`${stats.averageTime} min`} />
        <StatCard title="Accuracy" value={`${stats.accuracy}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase mb-3">Add solved problem</h3>
          {message && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                message.type === "success" ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
              }`}
            >
              {message.text}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-muted">Problem name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g., Two Sum"
            />

            <div>
              <label className="block text-sm text-muted">Problem description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="Describe the problem for AI evaluation..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={handleChange("difficulty")}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {difficulties.map((opt) => (
                    <option key={opt} value={opt} className="bg-surface">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted">Language</label>
                <select
                  value={form.language}
                  onChange={handleChange("language")}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {languages.map((opt) => (
                    <option key={opt} value={opt} className="bg-surface">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted">Time (min)</label>
                <input
                  type="number"
                  min={1}
                  value={form.timeTakenMinutes}
                  onChange={handleChange("timeTakenMinutes")}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-muted">Attempts</label>
                <input
                  type="number"
                  min={1}
                  value={form.attempts}
                  onChange={handleChange("attempts")}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Topics (select at least one)</label>
              <div className="grid grid-cols-2 gap-2">
                {topicOptions.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      form.topics.includes(topic)
                        ? "bg-accent text-bg"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">Your Code *</label>
              <p className="text-xs text-muted mb-2">Code submission is mandatory for AI evaluation</p>
              <textarea
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                rows={8}
                required
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                placeholder={`Paste your ${form.language} solution here...`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-bg shadow hover:bg-accent/90 disabled:opacity-50"
            >
              {saving ? "Evaluating..." : "Submit & Evaluate"}
            </button>
          </form>
        </div>

        {submissionResult && (
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
            <h3 className="text-sm font-semibold text-muted uppercase mb-4">Evaluation Result</h3>
            
            {submissionResult.stderr && (
              <div className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm">
                <div className="text-red-100 font-semibold mb-1">❌ Execution Error:</div>
                <div className="text-red-100 text-xs font-mono">{submissionResult.stderr}</div>
              </div>
            )}
            
            {submissionResult.stdout && (
              <div className="mb-3 rounded-lg bg-blue-500/20 px-3 py-2 text-sm">
                <div className="text-blue-100 font-semibold mb-1">📤 Output:</div>
                <div className="text-blue-100 text-xs font-mono">{submissionResult.stdout}</div>
              </div>
            )}
            
            {submissionResult.feedback && (
              <div className="mb-3 rounded-lg bg-cyan-500/20 px-3 py-2 text-sm">
                <div className="text-cyan-100 font-semibold mb-1">🤖 AI Feedback:</div>
                <div className="text-cyan-100 text-xs">{submissionResult.feedback}</div>
              </div>
            )}
            
            {submissionResult.score !== null && submissionResult.score !== undefined && (
              <div className="mb-3 rounded-lg bg-green-500/20 px-3 py-2 text-sm">
                <div className="text-green-100 font-semibold">⭐ Score: {submissionResult.score}/100</div>
              </div>
            )}
            
            <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              submissionResult.score > 60 
                ? "bg-green-500/20 text-green-100" 
                : "bg-red-500/20 text-red-100"
            }`}>
              {submissionResult.score > 60 ? "✅ PASS" : "❌ FAIL"}
            </div>
          </div>
        )}

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted uppercase mb-4">Recent problems</h3>
          {loading ? (
            <div className="text-sm text-muted">Loading...</div>
          ) : problems.length === 0 ? (
            <div className="text-sm text-muted">No problems logged yet.</div>
          ) : (
            <div className="space-y-3">
              {problems.slice(0, 12).map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Tag label={p.difficulty} />
                        {p.language && <Tag label={p.language} />}
                        {p.topics.map((topic) => (
                          <Tag key={topic} label={topic} />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted">{new Date(p.solvedAt).toLocaleDateString()}</div>
                      {p.score !== null && p.score !== undefined && (
                        <div className="mt-1 text-sm font-semibold">
                          {p.score > 60 ? "✅" : "❌"} {p.score}/100
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <span>Time: {p.timeTakenMinutes} min</span>
                    <span>Attempts: {p.attempts}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
