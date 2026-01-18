export function Header({ onAdminClick, isAdmin }) {
  return (
    <header className="text-center text-white mb-8 relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-cyan-400 drop-shadow-2xl">
        ✨ Community Spotlight
      </h1>
      <p className="text-lg text-slate-300">
        Vote for your favorites and discover who's trending!
      </p>
      <button
        onClick={onAdminClick}
        className={`absolute top-0 right-0 px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer shadow-lg shadow-purple-500/20 ${
          isAdmin
            ? "bg-amber-400 border-amber-300 text-slate-900 shadow-amber-400/50"
            : "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
        }`}
      >
        {isAdmin ? "👑 Admin Mode" : "🔐 Admin Mode"}
      </button>
    </header>
  );
}
