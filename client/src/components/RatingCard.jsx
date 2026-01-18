import { useState } from "react";
import { submitRating, deleteVote } from "../api";
import { useToast } from "../context/ToastContext";

const defaultImage =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23999" font-size="14">No Image</text></svg>';

export function RatingCard({ person, onRefresh }) {
  const { showToast, showConfirm } = useToast();
  const [rating, setRating] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const images = person.images.length > 0 ? person.images : [defaultImage];

  const handleSubmitRating = async () => {
    setSubmitting(true);
    try {
      await submitRating(person.id, rating);
      setSubmitted(true);
      showToast("Vote submitted! Thanks for participating! 🎉", "success");
      setTimeout(() => {
        onRefresh();
      }, 1500);
    } catch (err) {
      if (err.alreadyVoted) {
        showToast(
          "You already voted! Delete your vote to vote again.",
          "error",
        );
        onRefresh();
      } else {
        showToast("Error submitting rating", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVote = () => {
    showConfirm("Delete your vote for this person?", {
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await deleteVote(person.id);
          showToast("Vote deleted! You can vote again.", "success");
          onRefresh();
        } catch (err) {
          showToast("Error deleting vote", "error");
        }
      },
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/70 rounded-2xl shadow-xl shadow-purple-500/10 overflow-hidden hover:border-purple-500/50 hover:-translate-y-0.5 transition-all">
      <div className="p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>Profile</span>
          <span>
            {images.length} photo{images.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Image Grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {images.map((src, index) => (
            <img
              key={`${person.id}-${index}`}
              src={src}
              alt={`${person.name} ${index + 1}`}
              className="aspect-square w-full object-cover rounded-xl bg-slate-800 ring-2 ring-cyan-500/30 hover:ring-cyan-400/60 transition-all"
            />
          ))}
        </div>

        {/* Content Section */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{person.name}</h3>
          <div className="flex justify-between text-sm">
            <span className="text-amber-300">⭐ Avg: {person.avgRating}/5</span>
            <span className="text-purple-300">
              👥 {person.totalRatings} ratings
            </span>
          </div>
        </div>

        {person.userVoted ? (
          <div className="text-center">
            <div className="bg-emerald-500/30 text-emerald-100 py-2 px-4 rounded-lg mb-3 border border-emerald-400/50 shadow-lg shadow-emerald-500/20">
              Your vote: <strong>{person.userRating}/5</strong>
            </div>
            <button
              onClick={handleDeleteVote}
              className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer hover:underline transition-all"
            >
              🗑️ Delete Vote & Vote Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
                aria-label="Rating slider"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
            <div className="text-center text-4xl font-bold text-cyan-400 mb-4">
              {rating} ⭐
            </div>
            <button
              onClick={handleSubmitRating}
              disabled={submitting || submitted}
              className={`w-full py-3 rounded-lg font-semibold transition-all cursor-pointer shadow-lg ${
                submitted
                  ? "bg-emerald-500 text-white shadow-emerald-500/50"
                  : "bg-cyan-500 text-white hover:scale-[1.02] hover:shadow-cyan-500/50"
              } disabled:opacity-70`}
            >
              {submitted
                ? "✓ Submitted!"
                : submitting
                  ? "Submitting..."
                  : "Submit Vote"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
