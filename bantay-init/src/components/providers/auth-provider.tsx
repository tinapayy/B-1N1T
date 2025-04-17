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
    // Simulate fetching auth state (e.g., from a token in localStorage or a server)
    const checkAuth = async () => {
      try {
        // Example: Check for a token in localStorage
        const token = localStorage.getItem("authToken");
        if (token) {
          // Simulate an API call to validate the token and get user data
          await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
          const userData = { id: "1", role: "admin" }; // Mock user data
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    // Simulate login API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const userData = { id: "1", role: "admin" }; // Mock successful login
    setUser(userData);
    localStorage.setItem("authToken", "mock-token");
    router.push("/admin"); // Redirect to admin dashboard after login
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
