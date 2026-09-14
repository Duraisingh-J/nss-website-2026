import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRecord, setAdminRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Helper to verify if an authenticated user is an active administrator in admin_users
  const verifyAdminAccess = useCallback(async (authUser) => {
    if (!authUser) {
      return { isAuthorized: false, record: null };
    }

    try {
      // Query admin_users with RLS is_admin() condition
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, is_active, created_at, updated_at")
        .eq("id", authUser.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Admin verification error:", error.message);
        return { isAuthorized: false, record: null };
      }

      if (data && data.is_active) {
        return { isAuthorized: true, record: data };
      }

      // Also query via RPC as secondary check
      try {
        const { data: rpcResult } = await supabase.rpc("is_admin");
        if (rpcResult === true) {
          return { isAuthorized: true, record: data || { id: authUser.id, is_active: true } };
        }
      } catch (rpcErr) {
        // Ignore if RPC query fails, rely on table select
      }

      return { isAuthorized: false, record: null };
    } catch (err) {
      console.error("Error verifying admin status:", err);
      return { isAuthorized: false, record: null };
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error.message);
          if (isMounted) setIsLoading(false);
          return;
        }

        if (initialSession?.user) {
          const { isAuthorized, record } = await verifyAdminAccess(initialSession.user);

          if (isMounted) {
            if (isAuthorized) {
              setUser(initialSession.user);
              setSession(initialSession);
              setIsAdmin(true);
              setAdminRecord(record);
            } else {
              // User exists in auth.users but is NOT in admin_users -> clear session
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              setIsAdmin(false);
              setAdminRecord(null);
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error in auth initialization:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth state changes (e.g. token refresh, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === "SIGNED_OUT" || !currentSession) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setAdminRecord(null);
          setIsLoading(false);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const { isAuthorized, record } = await verifyAdminAccess(currentSession.user);
          if (isAuthorized) {
            setUser(currentSession.user);
            setSession(currentSession);
            setIsAdmin(true);
            setAdminRecord(record);
          } else {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            setAdminRecord(null);
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [verifyAdminAccess]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || "Invalid login credentials.");
      }

      if (!data?.user) {
        throw new Error("No user returned from authentication.");
      }

      // Check admin authorization
      const { isAuthorized, record } = await verifyAdminAccess(data.user);

      if (!isAuthorized) {
        // Automatically sign out non-admin users
        await supabase.auth.signOut();
        throw new Error("Access denied: You are not authorized as an NSS Administrator.");
      }

      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      setAdminRecord(record);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAdminRecord(null);
      setAuthError(null);
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    adminRecord,
    isLoading,
    authError,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
