import * as llm from "../config/llm.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";

async function buildUserStats(userId) {
  const problems = await Problem.find({ user: userId });
  const totalSolved = problems.filter((p) => p.score && p.score > 60).length;
  const totalAttempts = problems.length;
  const accuracy = totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : 0;

  const topicStats = {};
  problems.forEach((p) => {
    p.topics?.forEach((topic) => {
      if (!topicStats[topic]) topicStats[topic] = { count: 0, score: 0 };
      topicStats[topic].count++;
      if (p.score) topicStats[topic].score += p.score;
    });
  });

  const weakTopics = Object.entries(topicStats)
    .sort((a, b) => (a[1].score / a[1].count) - (b[1].score / b[1].count))
    .slice(0, 3)
    .map(([topic]) => topic);

  return {
    totalSolved,
    totalAttempts,
    accuracy: Number(accuracy.toFixed(1)),
    weakTopics,
    avgScore: problems.length > 0 ? Number((problems.reduce((sum, p) => sum + (p.score || 0), 0) / problems.length).toFixed(1)) : 0,
  };
}

async function saveUserAIData(userId, updates) {
  try {
    await User.findByIdAndUpdate(userId, { $set: updates });
  } catch (err) {
    console.warn("Failed to save AI data to user record:", err.message);
  }
}

export async function analysis(req, res, next) {
  try {
    const stats = await buildUserStats(req.user._id);
    const result = await llm.generateAnalysis(stats, "deepseek");
    await saveUserAIData(req.user._id, { "ai.lastAnalysis": result });
    res.json({ analysis: result });
  } catch (err) {
    next(err);
  }
}

export async function recommendation(req, res, next) {
  try {
    const stats = await buildUserStats(req.user._id);
    const result = await llm.generateRecommendation(stats, "gemini");
    await saveUserAIData(req.user._id, { "ai.lastRecommendation": result });
    res.json({ recommendation: result });
  } catch (err) {
    next(err);
  }
}

export async function hint(req, res, next) {
  try {
    const payload = req.body || {};
    const result = await llm.generateHint(payload, "deepseek");
    await saveUserAIData(req.user._id, {
      "ai.lastHint.text": result,
      "ai.lastHint.problemName": payload.problemName || "",
      "ai.lastHint.topic": payload.topic || "",
      "ai.lastHint.difficulty": payload.difficulty || "",
      "ai.lastHint.stage": payload.stage || 1,
    });
    res.json({ hint: result });
  } catch (err) {
    next(err);
  }
}

export async function performanceAnalysis(req, res, next) {
  try {
    const userId = req.user._id;
    
    // Aggregate user stats from problems
    const problems = await Problem.find({ user: userId });
    
    // If no problems solved yet, return a starter message
    if (problems.length === 0) {
      const starterAnalysis = `STRENGTHS:
- Fresh start with no prior attempts - full potential ahead!
- Ready to begin your competitive programming journey

WEAKNESSES:
- No practice data available yet
- Need to start solving problems to identify specific areas for improvement

DAILY PLAN:
- 30 minutes: Start with easy Array problems on LeetCode
- 30 minutes: Learn basic data structures (Arrays, Strings, Hash Tables)
- 30 minutes: Solve 2-3 simple problems focusing on understanding concepts
- 30 minutes: Review solutions and understand different approaches

Begin your journey by solving your first few problems to get personalized analysis!`;
      await saveUserAIData(userId, { "ai.lastPerformanceAnalysis": starterAnalysis });
      return res.json({ analysis: starterAnalysis });
    }
    
    const totalSolved = problems.filter(p => p.score && p.score > 60).length;
    const totalAttempts = problems.length;
    const accuracy = totalAttempts > 0 ? (totalSolved / totalAttempts * 100).toFixed(1) : 0;
    
    const topicStats = {};
    problems.forEach(p => {
      p.topics?.forEach(topic => {
        if (!topicStats[topic]) topicStats[topic] = { count: 0, score: 0 };
        topicStats[topic].count++;
        if (p.score) topicStats[topic].score += p.score;
      });
    });
    
    const weakTopics = Object.entries(topicStats)
      .sort((a, b) => (a[1].score / a[1].count) - (b[1].score / b[1].count))
      .slice(0, 3)
      .map(([topic]) => topic);
    
    const userStats = {
      totalSolved,
      totalAttempts,
      accuracy,
      weakTopics,
      avgScore: problems.length > 0 ? (problems.reduce((sum, p) => sum + (p.score || 0), 0) / problems.length).toFixed(1) : 0,
    };
    
    const result = await llm.generatePerformanceAnalysis(userStats, "deepseek");
    await saveUserAIData(userId, { "ai.lastPerformanceAnalysis": result });
    res.json({ analysis: result });
  } catch (err) {
    next(err);
  }
}

export async function getMCQQuestions(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    // Check if user has already taken an interview today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.mcqInterviews.lastInterviewDate && user.mcqInterviews.lastInterviewDate >= today) {
      return res.status(400).json({ error: "You can only take one MCQ interview per day." });
    }
    
    const questions = await llm.generateMCQQuestions(20, "deepseek");
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function submitMCQAnswers(req, res, next) {
  try {
    const userId = req.user._id;
    const { answers } = req.body; // answers should be an array of {questionIndex, selectedAnswer}
    
    const user = await User.findById(userId);
    
    // Check if user has already taken an interview today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.mcqInterviews.lastInterviewDate && user.mcqInterviews.lastInterviewDate >= today) {
      return res.status(400).json({ error: "You can only take one MCQ interview per day." });
    }
    
    // Generate questions again to check answers
    const questions = await llm.generateMCQQuestions(20, "deepseek");
    
    let correctCount = 0;
    const results = answers.map((answer, index) => {
      const question = questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });
    
    const score = Math.round((correctCount / questions.length) * 100);
    
    // Update user stats
    const newTotalInterviews = user.mcqInterviews.totalInterviews + 1;
    const newTotalScore = user.mcqInterviews.totalScore + score;
    const newAverageScore = Math.round(newTotalScore / newTotalInterviews);
    const newBestScore = Math.max(user.mcqInterviews.bestScore, score);
    
    await User.findByIdAndUpdate(userId, {
      $set: {
        "mcqInterviews.lastInterviewDate": new Date(),
        "mcqInterviews.totalInterviews": newTotalInterviews,
        "mcqInterviews.totalScore": newTotalScore,
        "mcqInterviews.averageScore": newAverageScore,
        "mcqInterviews.bestScore": newBestScore,
        points: user.points + score // Add score to total points
      }
    });
    
    res.json({
      score,
      correctCount,
      totalQuestions: questions.length,
      results,
      stats: {
        totalInterviews: newTotalInterviews,
        averageScore: newAverageScore,
        bestScore: newBestScore
      }
    });
  } catch (err) {
    next(err);
  }
}
