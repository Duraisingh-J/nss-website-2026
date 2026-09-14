import React, { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  Menu,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

export default function AdminTopbar({ onOpenSidebar }) {
  const { user, logout } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const adminEmail = user?.email || "admin@nssmit.org";
  const emailInitials = adminEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side: Hamburger (mobile) & Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            National Service Scheme &bull; MIT Campus
          </div>
          <div className="text-sm font-bold text-slate-900 font-serif">
            Administrative CMS Portal
          </div>
        </div>
      </div>

      {/* Right side: Database status, Admin user chip, Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Backend Connected Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px]">Supabase Live</span>
        </div>

        {/* User Dropdown / Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-hidden"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
              {emailInitials}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-medium text-slate-900 truncate max-w-[150px]">
                {adminEmail}
              </div>
              <div className="text-[10px] text-red-600 font-medium flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-red-600" />
                Verified Admin
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Signed in as</div>
                  <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                    {adminEmail}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Full Admin Privileges
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] text-slate-400 font-mono">
                    User ID: {user?.id?.substring(0, 8)}...
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Sign Out Action */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign Out"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isLoggingOut ? "..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
