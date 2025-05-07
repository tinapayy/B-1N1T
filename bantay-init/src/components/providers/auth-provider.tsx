"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: { id: string; role: string } | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const token = localStorage.getItem("authToken");

    const checkAuth = async () => {
      if (!token) return setIsLoading(false);
      try {
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await res.json();
        if (res.ok && isMounted.current) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (res.ok) {
      const { token, user } = data;
      localStorage.setItem("authToken", token);
      setUser(user);
      router.push("/admin");
    } else {
      throw new Error(data?.error || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    router.replace("/dashboard");
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
