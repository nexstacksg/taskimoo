import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check authentication server-side
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  if (!accessToken) {
    redirect("/login");
  }

  return <DashboardClient>{children}</DashboardClient>;
}
