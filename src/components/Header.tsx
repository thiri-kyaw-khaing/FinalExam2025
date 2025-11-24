import type { User } from "../types";
import { logout } from "../lib/mockApi";

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
                strokeWidth="2"
              />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            <div>
              <h1 className="text-xl font-bold">
                University Appointment Scheduler
              </h1>
              <p className="text-xs text-blue-100">
                Manage your schedule efficiently
              </p>
            </div>
          </div>

          {/* User Info and Logout */}
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-xs text-blue-100">
                  {currentUser.role === "STUDENT" ? "👨‍🎓 Student" : "👩‍🏫 Teacher"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
