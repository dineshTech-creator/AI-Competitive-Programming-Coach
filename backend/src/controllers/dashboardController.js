import Problem from "../models/Problem.js";

function summarizeTopics(problems, groupByCorrect = true) {
  const counts = {};
  problems.forEach((p) => {
    if (!p.topics) return;
    p.topics.forEach((topic) => {
      if (!counts[topic]) counts[topic] = 0;
      counts[topic] += 1;
    });
  });
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
  return sorted;
}

export async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const problems = await Problem.find({ user: userId }).sort({ solvedAt: -1 }).lean();

    const total = problems.length;
    const correct = problems.filter((p) => p.correct).length;
    const avgTime = total ? problems.reduce((sum, p) => sum + (p.timeTakenMinutes || 0), 0) / total : 0;

    const progress = [];
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayKey = day.toISOString().slice(0, 10);
      const count = problems.filter((p) => p.solvedAt.toISOString().slice(0, 10) === dayKey).length;
      progress.push({ date: dayKey, count });
    }

    const strength = summarizeTopics(problems.filter((p) => p.correct));
    const weakness = summarizeTopics(problems.filter((p) => !p.correct));

    res.json({
      stats: {
        totalSolved: total,
        accuracy: total ? Math.round((correct / total) * 100) : 0,
        avgTime: Math.round(avgTime * 10) / 10,
        strength,
        weakness,
      },
      progress,
    });
  } catch (err) {
    next(err);
  }
}
