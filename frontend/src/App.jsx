import Leaderboard from "./components/Leaderboard";
import MatchList from "./components/MatchList";
import AddMatch from "./components/AddMatch";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import pingPongLogo from "./assets/ping-pong-logo.svg";
import { Trophy, History, PlusCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getCsrfTokenFromCookie } from "./utils/csrf";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("leaderboard"); // 'leaderboard' | 'history' | 'add' | 'profile' | 'login' | 'register'
  const [userProfile, setUserProfile] = useState(null);

  // On mount, check if the browser already has a valid session cookie
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUserProfile(data);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    const csrfToken = getCsrfTokenFromCookie();
    fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: "POST",
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      credentials: "include",
    }).finally(() => {
      setIsAuthenticated(false);
      setUserProfile(null);
      if (activeTab === "add" || activeTab === "profile") {
        setActiveTab("leaderboard");
      }
    });
  };

  const handleLogin = () => {
    fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUserProfile(data);
          setIsAuthenticated(true);
          setActiveTab("leaderboard");
        }
      });
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ backgroundColor: "#EFE4D2" }}
    >
      <div className="flex flex-col w-full max-w-3xl px-3 py-4 md:p-8 font-sans text-stone-900">
        <header className="flex justify-between items-center mb-6 md:mb-10 pb-4 md:pb-6 border-b border-stone-300">
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src={pingPongLogo}
              alt="PongDistrict logo"
              className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0"
            />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900">
              PongDistrict
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-stone-500 text-sm hidden md:inline-block">
                  {userProfile?.username || "Player"}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-white hover:bg-stone-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium border border-stone-300 text-stone-700"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("login")}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-[#EFE4D2] transition-colors px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <nav className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 mb-6 md:mb-8 bg-[#E5D9C8] p-1 rounded-xl border border-stone-300 w-full sm:w-max">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "leaderboard"
                ? "bg-stone-800 text-[#EFE4D2]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-stone-800 text-[#EFE4D2]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
            }`}
          >
            <History className="w-4 h-4" /> Match History
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => setActiveTab("add")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "add"
                    ? "bg-stone-800 text-[#EFE4D2]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Record Match
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-stone-800 text-[#EFE4D2]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                }`}
              >
                <User className="w-4 h-4" /> Profile
              </button>
            </>
          )}
        </nav>

        <main className="flex-1 bg-white/60 border border-stone-200 rounded-2xl p-4 md:p-6 shadow-sm">
          {activeTab === "leaderboard" && <Leaderboard />}
          {activeTab === "history" && <MatchList />}
          {activeTab === "add" && isAuthenticated && (
            <AddMatch currentUser={userProfile} />
          )}
          {activeTab === "profile" && isAuthenticated && <Profile />}
          {activeTab === "login" && !isAuthenticated && (
            <Login
              onLogin={handleLogin}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          )}
          {activeTab === "register" && !isAuthenticated && (
            <Register onSwitchToLogin={() => setActiveTab("login")} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
