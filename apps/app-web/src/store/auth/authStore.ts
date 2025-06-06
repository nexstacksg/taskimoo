import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IUserPublic } from "@app/shared-types";
import authService from "@/services/authService";

interface AuthState {
  user: IUserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (_email: string, _password: string) => Promise<void>;
  register: (_data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  setUser: (_user: IUserPublic | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, _get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (_email: string, _password: string) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await authService.login({ email: _email, password: _password });
            set((state) => {
              state.user = response.user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : "Login failed";
              state.isLoading = false;
            });
            throw error;
          }
        },

        // Register action
        register: async (_data) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await authService.register(_data);
            set((state) => {
              state.user = response.user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : "Registration failed";
              state.isLoading = false;
            });
            throw error;
          }
        },

        // Logout action
        logout: async () => {
          set((state) => {
            state.isLoading = true;
          });

          try {
            await authService.logout();
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.isLoading = false;
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : "Logout failed";
              state.isLoading = false;
            });
          }
        },

        // Fetch profile action
        fetchProfile: async () => {
          set((state) => {
            state.isLoading = true;
          });

          try {
            const user = await authService.getProfile();
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch {
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.isLoading = false;
            });
          }
        },

        // Clear error
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Set user
        setUser: (_user) => {
          set((state) => {
            state.user = _user;
            state.isAuthenticated = !!_user;
          });
        },
      })),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
