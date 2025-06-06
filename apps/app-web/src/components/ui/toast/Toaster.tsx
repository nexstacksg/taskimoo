"use client";

import { useUIStore } from "@/store/ui/uiStore";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./Toast";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  error: <XCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
};

export function Toaster() {
  const { toasts, hideToast } = useUIStore();

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open={true}
          onOpenChange={(open) => {
            if (!open) hideToast(toast.id);
          }}
          variant={toast.type === "error" ? "destructive" : "default"}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{iconMap[toast.type]}</div>
            <div className="grid gap-1">
              <ToastTitle>
                {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
              </ToastTitle>
              <ToastDescription>{toast.message}</ToastDescription>
            </div>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
