export function Header({ onAdminClick, isAdmin }) {
  return (
    <header className="text-center text-white mb-8 relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
        🏆 Face Rank
      </h1>
      <p className="text-lg opacity-90">Rate people and see the leaderboard!</p>
      <button
        onClick={onAdminClick}
        className={`absolute top-0 right-0 px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer shadow-lg ${
          isAdmin
            ? "bg-amber-400 border-amber-300 text-slate-900"
            : "border-cyan-300/40 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
        }`}
      >
        {isAdmin ? "👑 Admin Mode" : "🔐 Admin Mode"}
      </button>
    </header>
  );
}
