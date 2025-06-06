"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { useState } from "react";
import {
  Plus,
  Filter,
  Search,
  Star,
  Share2,
  Settings,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

const getPageTitle = (pathname: string) => {
  const paths: { [key: string]: string } = {
    "/dashboard": "Dashboard",
    "/workspaces": "Workspaces",
    "/tasks": "Tasks",
    "/requirements": "Requirements",
    "/team": "Team",
    "/analytics": "Analytics",
    "/settings": "Settings",
  };
  return paths[pathname] || "TaskiMoo";
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-2 flex-1">
        <h1 className="text-lg font-medium text-gray-900">{pageTitle}</h1>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Star className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* View Options */}
        <div className="flex items-center gap-1 mr-2 border-r border-gray-200 pr-2">
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-1">
            <span>List</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded">
            Board
          </button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded">
            Calendar
          </button>
        </div>

        {/* Action Buttons */}
        <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
          <Search className="h-3.5 w-3.5 mr-1" />
          Search
        </Button>

        <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
          <Filter className="h-3.5 w-3.5 mr-1" />
          Filter
        </Button>

        <Button size="sm" variant="default" className="text-xs h-7 px-3">
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Task
        </Button>

        <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <User className="h-4 w-4 text-gray-600" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">john@example.com</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4 text-gray-600" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left disabled:opacity-50 border-t border-gray-100"
                >
                  <LogOut className="h-4 w-4 text-gray-600" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
