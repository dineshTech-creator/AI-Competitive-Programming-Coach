export default function StatCard({ title, value, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-surface/50 p-4 shadow-soft ${className}`}>
      <div className="text-xs text-muted uppercase tracking-wide">{title}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-3xl font-semibold">{value}</div>
        {children}
      </div>
    </div>
  );
}
