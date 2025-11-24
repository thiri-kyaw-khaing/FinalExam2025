import { useState, useEffect } from "react";
import type { User } from "../types";
import { getUsers, login } from "../lib/mockApi";

interface LoginSimProps {
  onLogin: (user: User) => void;
}

export function LoginSim({ onLogin }: LoginSimProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<
    "STUDENT" | "TEACHER" | null
  >(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userId: string) => {
    try {
      const user = await login(userId);
      onLogin(user);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const students = users.filter((u) => u.role === "STUDENT");
  const teachers = users.filter((u) => u.role === "TEACHER");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <svg
            className="w-16 h-16 mx-auto text-blue-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            University Appointment Scheduler
          </h1>
          <p className="text-gray-600">Select your role to continue</p>
        </div>

        {/* Role Selection or User List */}
        {!selectedRole ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Card */}
            <button
              onClick={() => setSelectedRole("STUDENT")}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left"
            >
              <div className="text-5xl mb-4">👨‍🎓</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Student</h2>
              <p className="text-gray-600">
                Browse and book appointments with teachers
              </p>
            </button>

            {/* Teacher Card */}
            <button
              onClick={() => setSelectedRole("TEACHER")}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left"
            >
              <div className="text-5xl mb-4">👩‍🏫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher</h2>
              <p className="text-gray-600">
                Manage your schedule and view bookings
              </p>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to role selection
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Select a {selectedRole === "STUDENT" ? "Student" : "Teacher"}{" "}
              Account
            </h2>

            <div className="space-y-3">
              {(selectedRole === "STUDENT" ? students : teachers).map(
                (user) => (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user.id)}
                    className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border-2 border-transparent hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {selectedRole === "STUDENT" ? "👨‍🎓" : "👩‍🏫"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Demo Warning */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Demo Mode:</strong> No password required. This is an
            educational MVP using mock authentication. Production version will
            use university SSO.
          </p>
        </div>
      </div>
    </div>
  );
}
