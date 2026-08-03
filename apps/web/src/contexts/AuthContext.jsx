import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  getInitialCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../features/auth/api/auth.service.js";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");

  const clearSession = useCallback(() => {
    setUser(null);
    setStatus("anonymous");
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        clearSession();
        return;
      }
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      if (error.status !== 401) {
        console.error("Vérification de session impossible", error);
      }
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    let ignore = false;

    getInitialCurrentUser()
      .then((currentUser) => {
        if (ignore) return;
        if (!currentUser) {
          setUser(null);
          setStatus("anonymous");
          return;
        }
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (ignore) return;
        if (error.status !== 401) {
          console.error("Vérification de session impossible", error);
        }
        setUser(null);
        setStatus("anonymous");
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    window.addEventListener("auth:session-expired", clearSession);
    return () =>
      window.removeEventListener("auth:session-expired", clearSession);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const authenticatedUser = await loginRequest(credentials);
    setUser(authenticatedUser);
    setStatus("authenticated");
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      refreshUser: checkSession,
    }),
    [checkSession, login, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
