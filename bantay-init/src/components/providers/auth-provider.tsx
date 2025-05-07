"use client";

import { createContext, useContext, useState, useEffect } from "react";
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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  
    const data = await res.json(); // <== MISSING before
  
    if (res.ok) {
      const { token, user } = data;
      localStorage.setItem("authToken", token);
      setUser(user);
      router.push("/admin");
    } else {
      console.error("Login failed:", data); // now logs { error: "Invalid credentials" }
      throw new Error(data?.error || "Login failed");
    }
  };
  

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    router.push("/login");
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
