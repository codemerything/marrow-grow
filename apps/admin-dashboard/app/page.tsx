"use client"

import { useEffect, useState } from "react";
import { LoginPage } from "@/components/login-page";
import { AdminDashboard } from "@/components/admin-dashboard";
import { useAdminStore, clearAdminSession } from "@/store/AdminStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function App() {
  const { accessToken, adminUser, isHydrated, setAccessToken, setAdminUser } = useAdminStore();
  console.log('[App] Initial store state:', { isHydrated, accessToken, adminUser });
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Don't do anything until Zustand has hydrated from localStorage
    console.log('[useEffect] Checking hydration. isHydrated:', isHydrated);
    if (!isHydrated) {
      return;
    }

    // Don't check auth multiple times
    console.log('[useEffect] Checking auth status. hasCheckedAuth:', hasCheckedAuth);
    if (hasCheckedAuth) {
      return;
    }

    const checkAuthStatus = async () => {
      console.log('[checkAuthStatus] Starting auth check.');
      setHasCheckedAuth(true);

      try {
        // If we already have a valid session in memory, we're authenticated.
        console.log('[checkAuthStatus] Checking for existing session in memory:', { accessToken, adminUser });
        if (accessToken && adminUser) {
          setIsLoading(false);
          return;
        }

        // If we have a persisted adminUser but no accessToken, try to refresh
        console.log('[checkAuthStatus] Checking for persisted adminUser and no accessToken:', { adminUser, accessToken });
        if (adminUser && !accessToken) {
          console.log('[checkAuthStatus] Attempting to refresh token.');
          const res = await api.post("/api/auth/refresh-token");
          console.log('[checkAuthStatus] Refresh token response:', res);

          if (res.status === 200) {
            const data = res.data;
            setAccessToken(data.accessToken);
            setAdminUser(data.player);
          } else {
            // Refresh failed, clear everything
            console.log('[checkAuthStatus] Refresh token failed. Clearing session.');
            clearAdminSession();
          }
        }
        // If no adminUser at all, we're not authenticated - no need to call refresh
        console.log('[checkAuthStatus] No adminUser found, not attempting refresh.');
      } catch (error) {
        console.error("[checkAuthStatus] Error during authentication refresh:", error);
        clearAdminSession();
      } finally {
        console.log('[checkAuthStatus] Finished auth check. setIsLoading(false).');
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [isHydrated, hasCheckedAuth, accessToken, adminUser, setAccessToken, setAdminUser]);

  const handleLoginSuccess = (newAccessToken: string, newAdminUser: any) => {
    console.log('[handleLoginSuccess] Login successful. Received:', { newAccessToken, newAdminUser });
    setAccessToken(newAccessToken);
    setAdminUser(newAdminUser);
    console.log("Login successful, store has been updated.");
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/signout');
    } catch (error) {
      console.error("Error during server-side logout:", error);
    }
    
    // Clear session data
    clearAdminSession();
    
    // Reset the auth check flag so it can run again
    setHasCheckedAuth(false);
    setIsLoading(true);
    
    // Force reload to ensure clean state
    window.location.href = '/';
  };

  const isAuthenticated = !!accessToken && !!adminUser;

  // Show loading while Zustand is hydrating or while checking auth
  console.log('[Render] Checking loading conditions:', { isHydrated, isLoading });
  if (!isHydrated || isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading application...</p>
        </div>
    );
  }

  // Show login page if not authenticated
  console.log('[Render] Checking authentication status. isAuthenticated:', isAuthenticated);
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  // Show dashboard if authenticated
  console.log('[Render] Rendering AdminDashboard.');
  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
}