import { useMemo, useState } from "react";
import { getAIAnalysis, getAIRecommendation, requestHint, getPerformanceAnalysis } from "../services/api";

const topicOptions = ["Arrays", "Strings", "Graphs", "Dynamic Programming", "Trees", "Math", "Sorting", "Greedy"];
const difficultyOptions = ["Easy", "Medium", "Hard"];

export default function AIPage() {
  const [analysis, setAnalysis] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [hintStage, setHintStage] = useState(1);
  const [hintForm, setHintForm] = useState({
    problemName: "",
    topic: "Arrays",
    difficulty: "Easy",
  });
  const [performanceAnalysis, setPerformanceAnalysis] = useState("");
  const [performanceLoading, setPerformanceLoading] = useState(false);

  const fetchAnalysis = async () => {
    const res = await getAIAnalysis();
    setAnalysis(res.analysis);
  };

  const fetchRecommendation = async () => {
    const res = await getAIRecommendation();
    setRecommendation(res.recommendation);
  };

  const requestHintFn = async () => {
    setHintLoading(true);
    try {
      const res = await requestHint({
        ...hintForm,
        stage: hintStage,
      });
      setHint(res.hint);
    } catch (err) {
      setHint("Could not retrieve hint. Try again.");
    } finally {
      setHintLoading(false);
    }
  };

  const fetchPerformanceAnalysis = async () => {
    setPerformanceLoading(true);
    try {
      const res = await getPerformanceAnalysis();
      setPerformanceAnalysis(res.analysis);
    } catch (err) {
      setPerformanceAnalysis("Unable to generate performance analysis. Try again.");
    } finally {
      setPerformanceLoading(false);
    }
  };

  const hintStageLabel = useMemo(() => {
    if (hintStage === 1) return "Step 1";
    if (hintStage === 2) return "Step 2";
    return "Final hint";
  }, [hintStage]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">AI Coach</h2>
          <p className="text-sm text-muted">Get dynamic hints, analysis and practice recommendations.</p>
        </div>
      </header>

      {/* Performance Analysis Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted uppercase">Performance Analysis</h3>
            <button
              onClick={fetchPerformanceAnalysis}
              disabled={performanceLoading}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20 disabled:opacity-50"
            >
              {performanceLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm text-white/80 min-h-[200px]">
            {performanceAnalysis || "Click 'Analyze' to get a detailed performance breakdown with personalized recommendations."}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted uppercase">Daily Practice Plan</h3>
            <button
              onClick={fetchRecommendation}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20"
            >
              Generate
            </button>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm text-white/80 min-h-[200px]">
            {recommendation || "Generate a daily practice plan based on your past problems."}
          </div>
        </div>
      </div>

      {/* Hint Section */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase">Get a hint</h3>
            <p className="text-xs text-muted">Tell the AI what you're stuck on.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">{hintStageLabel}</span>
            <select
              value={hintStage}
              onChange={(e) => setHintStage(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value={1}>Step 1</option>
              <option value={2}>Step 2</option>
              <option value={3}>Final</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-muted">Problem name</label>
            <input
              value={hintForm.problemName}
              onChange={(e) => setHintForm((prev) => ({ ...prev, problemName: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Two Sum"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Topic</label>
            <select
              value={hintForm.topic}
              onChange={(e) => setHintForm((prev) => ({ ...prev, topic: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {topicOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-surface">
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Difficulty</label>
            <select
              value={hintForm.difficulty}
              onChange={(e) => setHintForm((prev) => ({ ...prev, difficulty: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {difficultyOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-surface">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={requestHintFn}
            disabled={hintLoading}
            className="w-full md:w-auto rounded-lg bg-accent py-2 px-6 text-sm font-semibold text-bg shadow hover:bg-accent/90 disabled:opacity-50"
          >
            {hintLoading ? "Thinking..." : "Get hint"}
          </button>
          <div className="text-xs text-muted">
            Most hints are designed to help you progress without giving the full solution.
          </div>
        </div>

        <div className="mt-4 min-h-[120px] rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 whitespace-pre-wrap">
          {hint || "Hints will appear here."}
        </div>
      </div>
    </div>
  );
}
