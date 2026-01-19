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
    if (rank === 1)
      return "bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/50";
    if (rank === 2)
      return "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50";
    if (rank === 3)
      return "bg-orange-500 text-white shadow-lg shadow-orange-500/50";
    return "bg-slate-700 text-slate-200";
  };

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const groups = [];
  let lastRating = null;

  data.forEach((person) => {
    const ratingValue = person.avgRating;
    if (lastRating === null || ratingValue !== lastRating) {
      groups.push({ rating: ratingValue, people: [person] });
      lastRating = ratingValue;
    } else {
      groups[groups.length - 1].people.push(person);
    }
  });

  return (
    <div className="space-y-3">
      {groups.map((group, index) => {
        const rank = index + 1;
        return (
          <div
            key={`${group.rating}-${rank}`}
            className="bg-slate-900/80 border border-slate-800/70 rounded-2xl p-4 flex items-start gap-4 shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankStyle(
                rank,
              )}`}
            >
              {getMedal(rank)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                {group.people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-3 py-2"
                  >
                    <img
                      src={person.image || defaultImage}
                      alt={person.name}
                      className="w-12 h-12 object-cover rounded-full ring-2 ring-cyan-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white leading-tight">
                        {person.name}
                      </h4>
                      <span className="text-purple-300 text-xs">
                        {person.totalRatings} ratings
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-400 whitespace-nowrap">
              {group.rating}/5
            </div>
          </div>
        );
      })}
    </div>
  );
}
