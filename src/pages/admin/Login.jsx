import React, { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import "../../styles/admin.css";

export default function Login() {
  const { user, isAdmin, login, isLoading: authLoading } = useAdminAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already authenticated and verified as admin, redirect to target or dashboard
  const from = location.state?.from?.pathname || "/admin/dashboard";
  if (user && isAdmin && !authLoading) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please provide both email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation will be handled automatically by state update
    } catch (err) {
      console.error("Login attempt failed:", err);
      const msg = err.message || "Failed to sign in. Please verify your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-950/20 via-slate-900/10 to-transparent pointer-events-none blur-3xl -z-10" />
      <div className="absolute -top-32 right-10 w-80 h-80 rounded-full bg-red-600/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 left-10 w-80 h-80 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none -z-10" />

      {/* Back to website button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to NSS Website</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Institutional Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 shadow-xl shadow-red-950/60 ring-4 ring-slate-900 border border-red-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 bg-red-950/70 border border-red-800/40 px-2.5 py-0.5 rounded-full">
              Administrative CMS
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white tracking-tight font-serif">
              NSS MIT Anna University
            </h1>
            <p className="mt-1 text-xs text-slate-400 font-sans">
              Sign in with your verified administrator account
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800/80 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/70 border border-red-800/60 flex items-start space-x-3 text-red-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-red-300">Authentication Error</div>
                <div className="mt-0.5 text-red-200/90">{errorMessage}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/70 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/70 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Sign In to Admin CMS</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected by PostgreSQL Row-Level Security</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-relaxed font-mono">
              Access is restricted to authorized administrators recorded in the system.
            </p>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-8 text-center text-xs text-slate-400">
          National Service Scheme &bull; MIT Campus, Anna University
        </div>
      </div>
    </div>
  );
}
