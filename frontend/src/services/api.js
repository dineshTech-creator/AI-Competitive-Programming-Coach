import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  setAuthToken(data.token);
  return data;
}

export async function register(name, email, password) {
  const { data } = await api.post("/auth/register", { name, email, password });
  setAuthToken(data.token);
  return data;
}

export async function getProfile(token) {
  setAuthToken(token);
  const { data } = await api.get("/auth/profile");
  return data;
}

export async function getDashboard() {
  const { data } = await api.get("/dashboard");
  return data;
}

export async function addProblem(problem) {
  const { data } = await api.post("/problems", problem);
  return data;
}

export async function listProblems() {
  const { data } = await api.get("/problems");
  return data;
}

export async function getAIAnalysis() {
  const { data } = await api.get("/ai/analysis");
  return data;
}

export async function getAIRecommendation() {
  const { data } = await api.get("/ai/recommendation");
  return data;
}

export async function requestHint(payload) {
  const { data } = await api.post("/ai/hint", payload);
  return data;
}

export async function getLeaderboard(sortBy = "points") {
  const { data } = await api.get(`/leaderboard?sortBy=${sortBy}`);
  return data;
}

export async function getPerformanceAnalysis() {
  const { data } = await api.get("/ai/performance");
  return data;
}

export async function getMCQQuestions() {
  const { data } = await api.get("/ai/mcq-questions");
  return data;
}

export async function submitMCQAnswers(answers) {
  const { data } = await api.post("/ai/mcq-submit", { answers });
  return data;
}

export default api;
