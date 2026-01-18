import { useState, useEffect, useCallback } from "react";
import { ToastProvider, useToast } from "./context/ToastContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { Header } from "./components/Header";
import { TabNav } from "./components/TabNav";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { AdminPanel } from "./components/AdminPanel";
import { RatingCard } from "./components/RatingCard";
import { Leaderboard } from "./components/Leaderboard";
import { fetchPeople, fetchLeaderboard } from "./api";

function AppContent() {
  const { isAdmin, loginAdmin } = useAdmin();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("rate");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [people, setPeople] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [peopleData, leaderboardData] = await Promise.all([
        fetchPeople(),
        fetchLeaderboard(),
      ]);
      setPeople(peopleData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      showToast("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdminClick = () => {
    if (isAdmin) {
      setShowAdminPanel(!showAdminPanel);
    } else {
      setShowAdminModal(true);
    }
  };

  const handleAdminLogin = async (password) => {
    setAdminError("");
    try {
      await loginAdmin(password);
      setShowAdminModal(false);
      setShowAdminPanel(true);
      showToast("Admin mode activated!", "success");
    } catch (err) {
      setAdminError("Invalid password");
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-32 -left-16 h-80 w-80 bg-fuchsia-500/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-72 w-72 bg-emerald-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur">
          <Header onAdminClick={handleAdminClick} isAdmin={isAdmin} />

          <AdminLoginModal
            isOpen={showAdminModal}
            onClose={() => {
              setShowAdminModal(false);
              setAdminError("");
            }}
            onLogin={handleAdminLogin}
            error={adminError}
          />

          {isAdmin && showAdminPanel ? (
            <AdminPanel people={people} onRefresh={loadData} />
          ) : (
            <>
              <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 py-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`loading-${index}`}
                      className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse"
                    >
                      <div className="h-36 w-full rounded-xl bg-slate-800 mb-4" />
                      <div className="h-5 w-2/3 bg-slate-800 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-slate-800 rounded mb-4" />
                      <div className="h-10 w-full bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              ) : activeTab === "rate" ? (
                people.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl mb-4">
                      👥
                    </div>
                    <p className="text-xl text-slate-200">
                      No people to rate yet
                    </p>
                    <p className="text-slate-400 mt-2">
                      Ask an admin to add profiles to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {people.map((person) => (
                      <RatingCard
                        key={person.id}
                        person={person}
                        onRefresh={loadData}
                      />
                    ))}
                  </div>
                )
              ) : (
                <Leaderboard data={leaderboard} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </ToastProvider>
  );
}
