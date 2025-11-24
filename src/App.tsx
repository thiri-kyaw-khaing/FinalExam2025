import { useState, useEffect } from "react";
import type { User } from "./types";
import { seedData, isDataSeeded } from "./lib/seed";
import {
  getCurrentAuthUser,
  seedDemoAccounts,
  signOut as firebaseSignOut,
} from "./lib/Firebase";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { TeacherSchedule } from "./pages/TeacherSchedule";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🚀 App initializing...");

    try {
      // Initialize Firebase demo accounts
      console.log("📦 Seeding demo accounts...");
      seedDemoAccounts();

      // Initialize data on first load
      if (!isDataSeeded()) {
        console.log("📦 Seeding initial data...");
        seedData();
      } else {
        console.log("✅ Data already seeded");
      }

      // Check for existing Firebase auth session
      console.log("🔐 Checking for existing session...");
      const authUser = getCurrentAuthUser();
      if (authUser && authUser.user && authUser.user.uid) {
        console.log("✅ Found existing session:", authUser);
        // Map Firebase user to app User
        const user: User = {
          id: authUser.user.uid,
          name: authUser.user.displayName || authUser.user.email.split("@")[0],
          email: authUser.user.email,
          role: authUser.role,
          phone: "N/A", // Firebase doesn't store phone in this demo
        };
        setCurrentUser(user);
      } else {
        console.log("ℹ️ No existing session found");
      }

      setIsInitialized(true);
      console.log("✅ App initialized successfully");
    } catch (error) {
      console.error("❌ Error during initialization:", error);
      setInitError(error instanceof Error ? error.message : String(error));
      setIsInitialized(true); // Still set to initialized to show error UI
    }
  }, []);
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setCurrentUser(null);
    }
  };

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  // Show init error if any
  if (initError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Initialization Error
          </h1>
          <p className="text-gray-700 mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show auth page if no user
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Show role-specific dashboard
  if (currentUser.role === "STUDENT") {
    return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === "TEACHER") {
    return (
      <TeacherSchedule currentUser={currentUser} onLogout={handleLogout} />
    );
  }

  // Fallback (should never reach here)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">Unknown user role</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
