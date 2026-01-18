const defaultImage =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23999" font-size="14">No Image</text></svg>';

export function Leaderboard({ data }) {
  if (data.length === 0) {
    return (
      <div className="text-center text-white py-12">
        <p className="text-xl opacity-80">No rankings yet. Start rating!</p>
      </div>
    );
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-amber-400 text-slate-900";
    if (rank === 2) return "bg-slate-300 text-slate-900";
    if (rank === 3) return "bg-amber-600 text-amber-100";
    return "bg-slate-700 text-slate-200";
  };

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-3">
      {data.map((person, index) => {
        const rank = index + 1;
        return (
          <div
            key={person.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankStyle(
                rank,
              )}`}
            >
              {getMedal(rank)}
            </div>
            <img
              src={person.image || defaultImage}
              alt={person.name}
              className="w-14 h-14 object-cover rounded-full"
            />
            <div className="flex-1">
              <h4 className="font-bold text-slate-100">{person.name}</h4>
              <span className="text-slate-300 text-sm">
                {person.totalRatings} ratings
              </span>
            </div>
            <div className="text-2xl font-bold text-fuchsia-200">
              {person.avgRating}/5
            </div>
          </div>
        );
      })}
    </div>
  );
}
