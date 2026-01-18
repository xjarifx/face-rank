export function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex justify-center gap-3 mb-6">
      <button
        onClick={() => onTabChange("rate")}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all cursor-pointer border shadow-sm ${
          activeTab === "rate"
            ? "bg-cyan-400/20 text-cyan-100 border-cyan-300/60"
            : "bg-slate-900/60 text-slate-200 border-slate-700 hover:bg-slate-800"
        }`}
      >
        Rate
      </button>
      <button
        onClick={() => onTabChange("leaderboard")}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all cursor-pointer border shadow-sm ${
          activeTab === "leaderboard"
            ? "bg-fuchsia-400/20 text-fuchsia-100 border-fuchsia-300/60"
            : "bg-slate-900/60 text-slate-200 border-slate-700 hover:bg-slate-800"
        }`}
      >
        Leaderboard
      </button>
    </nav>
  );
}
