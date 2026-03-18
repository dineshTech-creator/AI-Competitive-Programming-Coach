import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, register as apiRegister, getProfile, setAuthToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ai_coach_token"));
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((tokenValue, userValue) => {
    if (tokenValue) {
      localStorage.setItem("ai_coach_token", tokenValue);
      setToken(tokenValue);
      setUser(userValue);
    } else {
      localStorage.removeItem("ai_coach_token");
      setToken(null);
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await getProfile(token);
      setUser(response.user);
    } catch (error) {
      setSession(null, null);
    } finally {
      setLoading(false);
    }
  }, [token, setSession]);

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(
    async (email, password) => {
      const response = await apiLogin(email, password);
      setSession(response.token, response.user);
      return response;
    },
    [setSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const response = await apiRegister(name, email, password);
      setSession(response.token, response.user);
      return response;
    },
    [setSession]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshProfile }),
    [user, token, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
