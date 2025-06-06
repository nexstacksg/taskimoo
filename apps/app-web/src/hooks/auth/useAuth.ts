import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/authStore";
import { useUIStore } from "@/store/ui/uiStore";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchProfile,
    clearError,
  } = useAuthStore();

  const showToast = useUIStore((state) => state.showToast);

  // Check authentication on mount
  useEffect(() => {
    // Only fetch profile once on mount
    fetchProfile().catch(() => {
      // User not authenticated, but that's okay for public pages
    });
  }, [fetchProfile]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      showToast({
        type: "success",
        message: "Welcome back!",
      });
      router.push("/dashboard");
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Login failed",
      });
    }
  };

  const handleRegister = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  }) => {
    try {
      await register(data);
      showToast({
        type: "success",
        message:
          "Registration successful! Please check your email to verify your account.",
        duration: 8000,
      });
      router.push("/dashboard");
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Registration failed",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        type: "info",
        message: "You have been logged out",
      });
      router.push("/login");
    } catch {
      showToast({
        type: "error",
        message: "Logout failed",
      });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
}
