import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface Modal {
  id: string;
  component: React.ComponentType<unknown>;
  props?: unknown;
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Modals
  modals: Modal[];

  // Toasts
  toasts: Toast[];

  // Loading states
  globalLoading: boolean;
  loadingMessage?: string;

  // Theme
  theme: "light" | "dark" | "system";

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (_open: boolean) => void;
  setSidebarCollapsed: (_collapsed: boolean) => void;

  showModal: (_modal: Omit<Modal, "id">) => void;
  hideModal: (_id: string) => void;
  hideAllModals: () => void;

  showToast: (_toast: Omit<Toast, "id">) => void;
  hideToast: (_id: string) => void;

  setGlobalLoading: (_loading: boolean, _message?: string) => void;
  setTheme: (_theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    immer((set) => ({
      // Initial state
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      modals: [],
      toasts: [],
      globalLoading: false,
      theme: "system",

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        });
      },

      setSidebarOpen: (_open) => {
        set((state) => {
          state.isSidebarOpen = _open;
        });
      },

      setSidebarCollapsed: (_collapsed) => {
        set((state) => {
          state.isSidebarCollapsed = _collapsed;
        });
      },

      // Modal actions
      showModal: (_modal) => {
        const id = Date.now().toString();
        set((state) => {
          state.modals.push({ ..._modal, id });
        });
      },

      hideModal: (_id) => {
        set((state) => {
          state.modals = state.modals.filter((modal) => modal.id !== _id);
        });
      },

      hideAllModals: () => {
        set((state) => {
          state.modals = [];
        });
      },

      // Toast actions
      showToast: (_toast) => {
        const id = Date.now().toString();
        set((state) => {
          state.toasts.push({ ..._toast, id });
        });

        // Auto-hide toast after duration
        if (_toast.duration !== 0) {
          setTimeout(() => {
            useUIStore.getState().hideToast(id);
          }, _toast.duration || 5000);
        }
      },

      hideToast: (_id) => {
        set((state) => {
          state.toasts = state.toasts.filter((toast) => toast.id !== _id);
        });
      },

      // Loading actions
      setGlobalLoading: (_loading, _message) => {
        set((state) => {
          state.globalLoading = _loading;
          state.loadingMessage = _message;
        });
      },

      // Theme actions
      setTheme: (_theme) => {
        set((state) => {
          state.theme = _theme;
        });
      },
    }))
  )
);
