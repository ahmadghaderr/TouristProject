import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../api/client";
import type { CurrentUser } from "../types";

const RETRY_DELAY_MS = 1500;

const isTransientError = (err: unknown): boolean =>
  axios.isAxiosError(err) && (!err.response || err.response.status >= 500);

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  authCheckFailed: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<CurrentUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [authCheckFailed, setAuthCheckFailed] = useState(false);

  // Resolves to the confirmed user, or null if the check was rejected (401)
  // or could not complete. Only a 401 clears the session; network errors and
  // 5xx (e.g. Render waking from sleep) are retried once, then leave the
  // current user untouched and set authCheckFailed.
  const refreshUser = useCallback(async (): Promise<CurrentUser | null> => {
    const fetchMe = () => apiClient.get<CurrentUser>("/user/me");
    try {
      let response;
      try {
        response = await fetchMe();
      } catch (err) {
        if (!isTransientError(err)) throw err;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        response = await fetchMe();
      }
      setUser(response.data);
      setAuthCheckFailed(false);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setUser(null);
        setAuthCheckFailed(false);
      } else {
        console.error("Auth check failed:", err);
        setAuthCheckFailed(true);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post("/user/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    loading,
    authCheckFailed,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
