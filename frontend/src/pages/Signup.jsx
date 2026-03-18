import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface/80 border border-white/10 shadow-soft rounded-2xl p-8 backdrop-blur">
        <h2 className="text-2xl font-semibold mb-2">Create an account</h2>
        <p className="text-sm text-muted mb-6">Start tracking your practice and improving faster.</p>

        {error && <div className="mb-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-muted">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-sm text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-sm text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-bg shadow hover:bg-accent/90"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`}
            className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition"
          >
            Sign up with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-accent">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
