import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";
import { authApi } from "../api/authApi";
import { UserResponse } from "../types";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("decisionhub_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.warn("Auto-login failed, token might be invalid/expired");
        localStorage.removeItem("decisionhub_token");
        localStorage.removeItem("decisionhub_user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const register = async (fullName: string, username: string, email: string, password: string) => {
    const data = await authService.register(fullName, username, email, password);
    if (data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const login = async (usernameOrEmail: string, password: string) => {
    const data = await authService.login(usernameOrEmail, password);
    if (data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};