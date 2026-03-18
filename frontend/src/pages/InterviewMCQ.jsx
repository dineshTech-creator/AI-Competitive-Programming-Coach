import { useEffect, useState } from "react";
import { getMCQQuestions, submitMCQAnswers } from "../services/api";

export default function InterviewMCQPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(1800); // 30 minutes
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await getMCQQuestions();
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(null));
      setStarted(true);
      setRunning(true);
    } catch (err) {
      alert("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = { questionIndex, selectedAnswer };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setLoading(true);
    setRunning(false);
    try {
      const res = await submitMCQAnswers(answers);
      setResults(res);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (submitted && results) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">MCQ Interview Results</h2>
            <p className="text-sm text-muted">Your performance summary</p>
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6 shadow-soft">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-accent mb-2">{results.score}%</h3>
            <p className="text-muted">Score ({results.correctCount}/{results.totalQuestions} correct)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-semibold">{results.stats.totalInterviews}</p>
              <p className="text-sm text-muted">Total Interviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{results.stats.averageScore}%</p>
              <p className="text-sm text-muted">Average Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{results.stats.bestScore}%</p>
              <p className="text-sm text-muted">Best Score</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Question Review:</h4>
            {results.results.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${result.isCorrect ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                <p className="font-medium mb-2">Question {index + 1}: {questions[index]?.question}</p>
                <p className="text-sm mb-1">Your answer: {result.selectedAnswer}</p>
                <p className="text-sm mb-2">Correct answer: {result.correctAnswer}</p>
                <p className="text-sm text-muted">{result.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">MCQ Interview</h2>
            <p className="text-sm text-muted">Test your competitive programming knowledge with 20 MCQs in 30 minutes</p>
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6 shadow-soft text-center">
          <h3 className="text-xl font-semibold mb-4">Ready to start?</h3>
          <p className="text-muted mb-6">This interview consists of 20 multiple-choice questions covering algorithms, data structures, and problem-solving concepts.</p>
          <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
            <li>• 30-minute time limit</li>
            <li>• 20 questions</li>
            <li>• One attempt per day</li>
            <li>• Score affects your total points</li>
          </ul>
          <button
            onClick={startInterview}
            disabled={loading}
            className="rounded-lg bg-accent py-3 px-8 text-lg font-semibold text-bg shadow hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Loading Questions..." : "Start Interview"}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">MCQ Interview</h2>
          <p className="text-sm text-muted">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-accent">{formatTime()}</p>
          <p className="text-xs text-muted">Time remaining</p>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-surface/50 p-6 shadow-soft">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{currentQuestion?.question}</h3>
          <div className="space-y-3">
            {currentQuestion?.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option.charAt(0)}
                  checked={answers[currentQuestionIndex]?.selectedAnswer === option.charAt(0)}
                  onChange={() => handleAnswerSelect(currentQuestionIndex, option.charAt(0))}
                  className="text-accent focus:ring-accent"
                />
                <span className="text-white/80">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || answers.some(a => a === null)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Interview"}
            </button>
          )}
        </div>

        <div className="mt-4 flex space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex
                  ? "bg-accent"
                  : answers[index]
                  ? "bg-green-500"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}