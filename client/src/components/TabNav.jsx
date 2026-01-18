export function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex justify-center mb-6">
      <div className="flex gap-2 rounded-full bg-slate-900/70 border border-slate-800 p-2 shadow-inner">
        <button
          onClick={() => onTabChange("rate")}
          className={`px-6 py-2.5 rounded-full text-base md:text-lg font-semibold transition-all cursor-pointer border ${
            activeTab === "rate"
              ? "bg-cyan-500/30 text-cyan-100 border-cyan-400/70 shadow-cyan-500/40"
              : "bg-transparent text-slate-300 border-transparent hover:bg-slate-800/80"
          }`}
        >
          ✨ Vote
        </button>
        <button
          onClick={() => onTabChange("leaderboard")}
          className={`px-6 py-2.5 rounded-full text-base md:text-lg font-semibold transition-all cursor-pointer border ${
            activeTab === "leaderboard"
              ? "bg-fuchsia-500/30 text-fuchsia-100 border-fuchsia-400/70 shadow-fuchsia-500/40"
              : "bg-transparent text-slate-300 border-transparent hover:bg-slate-800/80"
          }`}
        >
          🌟 Trending
        </button>
      </div>
    </nav>
  );
}
