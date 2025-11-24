import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  sendPasswordResetEmail,
  type FirebaseAuthCredentials,
} from "../lib/Firebase";
import type { User } from "../types";
import { createUser } from "../lib/mockApi";

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = "signin" | "signup" | "reset";

export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
    setPhone("");
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user: firebaseUser, role: userRole } =
        await signInWithEmailAndPassword(email, password);

      // Create User object for the app
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split("@")[0],
        email: firebaseUser.email,
        role: userRole,
        phone: phone || "N/A",
      };

      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required");
      setLoading(false);
      return;
    }

    try {
      const credentials: FirebaseAuthCredentials = {
        email,
        password,
        displayName: displayName.trim(),
        role,
      };

      const { user: firebaseUser, role: userRole } =
        await signUpWithEmailAndPassword(credentials);

      // Create user in the main app system
      const newUser: User = {
        id: firebaseUser.uid,
        name: displayName.trim(),
        email: firebaseUser.email,
        role: userRole,
        phone: phone || "N/A",
      };

      // Save to mock database
      await createUser(newUser);

      onLogin(newUser);
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(
        "Password reset email sent! Check your inbox (simulated for demo)."
      );
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            University Appointment Scheduler
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === "signin" && "Sign in to your account"}
            {mode === "signup" && "Create a new account"}
            {mode === "reset" && "Reset your password"}
          </p>
        </div>

        {/* Demo Warning */}
        {/* <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"> */}
        {/* <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm">
              <p className="font-semibold text-yellow-800">
                Demo Mode(otherwise you can register by yourself)
              </p>
              <p className="text-yellow-700 mt-1">
                <code className="text-xs">For student:student@demo.com</code>{" "}
                <p className="text-xs">For teacher:teacher@demo.com</p>
                Password: <code className="text-xs">password123</code>
              </p>
            </div>
          </div> */}

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Sign In Form */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                      role === "STUDENT"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("TEACHER")}
                    className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                      role === "TEACHER"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    👨‍🏫 Teacher
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Password Reset Form */}
          {mode === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
