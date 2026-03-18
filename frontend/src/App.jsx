import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/Dashboard";
import ProblemsPage from "./pages/Problems";
import AIPage from "./pages/AI";
import InterviewMCQPage from "./pages/InterviewMCQ";
import LeaderboardPage from "./pages/Leaderboard";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="problems" element={<ProblemsPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="interview-mcq" element={<InterviewMCQPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
