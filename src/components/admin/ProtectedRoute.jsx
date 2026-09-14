import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-red-950/50">
              <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
            </div>
            <Loader2 className="w-6 h-6 text-red-500 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold tracking-wide text-slate-100 font-serif">
              NSS MIT Admin CMS
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Verifying credentials & administrative privileges...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
