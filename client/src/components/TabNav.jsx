export function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex justify-center gap-3 mb-6">
      <button
        onClick={() => onTabChange("rate")}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all cursor-pointer border shadow-lg ${
          activeTab === "rate"
            ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 border-cyan-400/70 shadow-cyan-500/50"
            : "bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800/80 hover:border-slate-600"
        }`}
      >
        ✨ Vote
      </button>
      <button
        onClick={() => onTabChange("leaderboard")}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all cursor-pointer border shadow-lg ${
          activeTab === "leaderboard"
            ? "bg-gradient-to-r from-fuchsia-500/30 to-pink-500/30 text-fuchsia-100 border-fuchsia-400/70 shadow-fuchsia-500/50"
            : "bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800/80 hover:border-slate-600"
        }`}
      >
        🌟 Trending
      </button>
    </nav>
  );
}
