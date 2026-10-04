import { useCallback, useState } from "react";
import { loginAdmin } from "../services/api";
import type { AdminProfile } from "../types";

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminProfile | null>(() => {
    const raw = sessionStorage.getItem("admin_profile");
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginAdmin(email, password);
    sessionStorage.setItem("admin_token", data.token);
    sessionStorage.setItem("admin_profile", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_profile");
    setAdmin(null);
  }, []);

  const isAuthenticated = Boolean(sessionStorage.getItem("admin_token"));

  return { admin, login, logout, isAuthenticated };
}
