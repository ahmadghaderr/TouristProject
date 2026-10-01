import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../api/client";
import type { CurrentUser } from "../types";

// Render's free tier can take 30-60s to wake. Each attempt is capped so one
// hung request can't stall the sequence: worst case is 6 x 10s + 5 x 5s ~= 85s.
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
const ATTEMPT_TIMEOUT_MS = 10000;

const isUnauthorized = (err: unknown): boolean =>
  axios.isAxiosError(err) && err.response?.status === 401;

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<CurrentUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolves to the confirmed user, or null. A 401 means "not logged in"
  // immediately; any other failure is retried, and only once all retries are
  // exhausted is the user treated as logged out. loading stays true until then.
  const refreshUser = useCallback(async (): Promise<CurrentUser | null> => {
    try {
      for (let attempt = 0; ; attempt++) {
        try {
          const { data } = await apiClient.get<CurrentUser>("/user/me", {
            timeout: ATTEMPT_TIMEOUT_MS,
          });
          setUser(data);
          return data;
        } catch (err) {
          if (isUnauthorized(err)) {
            setUser(null);
            return null;
          }
          if (attempt >= MAX_RETRIES) {
            console.error("Auth check failed after retries:", err);
            setUser(null);
            return null;
          }
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
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
