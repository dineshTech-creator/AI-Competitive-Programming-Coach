import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BellIcon, ChartBarIcon, PuzzlePieceIcon, UserGroupIcon, LightBulbIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

const navItems = [
  { to: "/", label: "Dashboard", icon: ChartBarIcon },
  { to: "/problems", label: "Problems", icon: PuzzlePieceIcon },
  { to: "/ai", label: "AI Coach", icon: LightBulbIcon },
  { to: "/interview-mcq", label: "MCQ Interview", icon: BellIcon },
  { to: "/leaderboard", label: "Leaderboard", icon: UserGroupIcon },
];

function NavLinkItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive ? "bg-accent/20 text-accent" : "text-muted hover:bg-white/10"
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-bg">
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-surface border-r border-white/10 p-4 flex flex-col transition-transform duration-300 z-20 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-bg font-bold">AI</div>
            <div>
              <h1 className="text-lg font-semibold">CP Coach</h1>
              <p className="text-xs text-muted">Train smarter. Code stronger.</p>
            </div>
          </Link>
          <button
            type="button"
            className="md:hidden text-muted hover:text-white"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLinkItem key={item.to} to={item.to} label={item.label} Icon={item.icon} />
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col md:pl-72">
        <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            className="md:hidden text-muted hover:text-white"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
          <div className="text-sm text-muted">AI Competitive Programming Coach</div>
          <div className="text-xs text-muted">Stay consistent, earn badges</div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
