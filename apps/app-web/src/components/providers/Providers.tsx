"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toast/Toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
