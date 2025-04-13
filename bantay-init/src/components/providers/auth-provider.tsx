"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  role: "admin" | "user";
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("b1n1t-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("b1n1t-user");
      }
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    // In a real app, this would be an API call
    if (username === "admin" && password === "password") {
      const user = {
        id: "1",
        username: "admin",
        role: "admin" as const,
      };
      setUser(user);
      localStorage.setItem("b1n1t-user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("b1n1t-user");
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}
