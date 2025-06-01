"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import { IUserPublic, RegisterRequest } from "@app/shared-types";

interface AuthContextType {
  user: IUserPublic | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure cookies are available after hydration
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get user profile - cookies will be sent automatically
      const user = await authService.getProfile();

      if (user && user.id) {
        setUser(user);
      } else {
        setUser(null);
      }
    } catch {
      // User is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const authData = await authService.login({ email, password });
      setUser(authData.user);
      router.push("/");
    } catch (error) {
      const err = error as { message?: string };
      throw new Error(err.message || "Invalid email or password");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const authData = await authService.register(data);
      setUser(authData.user);
      router.push("/");
    } catch (error) {
      const err = error as { message?: string };
      throw new Error(err.message || "Registration failed");
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, register, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
