import { useState } from "react";

export function AdminLoginModal({ isOpen, onClose, onLogin, error }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(password);
      setPassword("");
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-900/90 border border-slate-800 p-10 rounded-2xl text-center max-w-md w-11/12 relative text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Admin Login</h2>
        <p className="text-sm text-slate-400 mb-5">
          Enter the admin password to manage profiles.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-3 border-2 border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-400 rounded-lg text-base mb-4 focus:outline-none focus:border-cyan-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-cyan-500 text-white rounded-lg text-base font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>
    </div>
  );
}
