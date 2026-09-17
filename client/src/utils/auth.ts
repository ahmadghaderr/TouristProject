import type { Role } from "../types";

export const getToken = (): string | null => localStorage.getItem("token");

export const getUserId = (): string | null => localStorage.getItem("userId");

export const getRole = (): Role | null =>
  (localStorage.getItem("role") as Role | null) ?? null;

export const isAuthenticated = (): boolean => Boolean(getToken());

export const isAdmin = (): boolean => getRole() === "admin";

export const setSession = (token: string, userId: string, role: Role): void => {
  localStorage.setItem("token", token);
  localStorage.setItem("userId", userId);
  localStorage.setItem("role", role);
};

export const clearSession = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
};
