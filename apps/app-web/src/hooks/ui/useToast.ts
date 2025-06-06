import { useUIStore } from "@/store/ui/uiStore";

export function useToast() {
  const { toasts, showToast, hideToast } = useUIStore();

  const toast = {
    success: (message: string, duration?: number) => {
      showToast({ message, type: "success", duration });
    },
    error: (message: string, duration?: number) => {
      showToast({ message, type: "error", duration });
    },
    warning: (message: string, duration?: number) => {
      showToast({ message, type: "warning", duration });
    },
    info: (message: string, duration?: number) => {
      showToast({ message, type: "info", duration });
    },
    custom: showToast,
    dismiss: hideToast,
  };

  return {
    toasts,
    toast,
  };
}
