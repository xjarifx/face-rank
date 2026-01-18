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
      showToast("Rating submitted!", "success");
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 flex flex-col gap-5">
        {/* Image Row */}
        <div className="flex flex-wrap gap-3">
          {images.map((src, index) => (
            <img
              key={`${person.id}-${index}`}
              src={src}
              alt={`${person.name} ${index + 1}`}
              className="h-36 w-36 object-cover rounded-xl bg-slate-800 ring-1 ring-slate-700"
            />
          ))}
        </div>

        {/* Content Section */}
        <h3 className="text-xl font-bold text-slate-100 mb-2">{person.name}</h3>
        <div className="flex justify-between text-slate-300 text-sm mb-4">
          <span>⭐ Avg: {person.avgRating}/5</span>
          <span>👥 {person.totalRatings} ratings</span>
        </div>

        {person.userVoted ? (
          <div className="text-center">
            <div className="bg-emerald-400/20 text-emerald-100 py-2 px-4 rounded-lg mb-3 border border-emerald-400/30">
              Your vote: <strong>{person.userRating}/5</strong>
            </div>
            <button
              onClick={handleDeleteVote}
              className="text-rose-300 hover:text-rose-200 font-medium cursor-pointer"
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
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
            <div className="text-center text-3xl font-bold text-cyan-200 mb-4">
              {rating}
            </div>
            <button
              onClick={handleSubmitRating}
              disabled={submitting || submitted}
              className={`w-full py-3 rounded-lg font-medium transition-all cursor-pointer ${
                submitted
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white hover:scale-[1.02]"
              } disabled:opacity-70`}
            >
              {submitted
                ? "✓ Submitted!"
                : submitting
                  ? "Submitting..."
                  : "Submit Rating"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
