import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  businessName: string | null;
  login: (businessName: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem("biz-auth");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.token && parsed.businessName) {
          setIsAuthenticated(true);
          setBusinessName(parsed.businessName);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const login = (name: string, token: string) => {
    localStorage.setItem("biz-auth", JSON.stringify({ businessName: name, token }));
    setIsAuthenticated(true);
    setBusinessName(name);
  };

  const logout = () => {
    localStorage.removeItem("biz-auth");
    setIsAuthenticated(false);
    setBusinessName(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, businessName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}