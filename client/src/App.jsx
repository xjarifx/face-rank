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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-slate-100">
      <div className="max-w-6xl mx-auto">
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

        {isAdmin && showAdminPanel && (
          <AdminPanel people={people} onRefresh={loadData} />
        )}

        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <div className="text-center text-white py-12">
            <p className="text-xl">Loading...</p>
          </div>
        ) : activeTab === "rate" ? (
          people.length === 0 ? (
            <div className="text-center text-white py-12">
              <p className="text-xl opacity-80">
                No people to rate yet. Admin needs to add some!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
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
