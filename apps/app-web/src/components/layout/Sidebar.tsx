"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/store/ui/uiStore";
import { useWorkspaceStore } from "@/store/workspace/workspaceStore";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  CheckSquare,
  FileText,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/workspaces", label: "Workspaces", icon: FolderOpen },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/requirements", label: "Requirements", icon: FileText },
  { href: "/team", label: "Team", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomNavItems = [
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { currentWorkspace } = useWorkspaceStore();
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
    <aside
      className={cn(
        "bg-gray-900 text-gray-100 flex flex-col transition-all duration-200",
        isSidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo/Brand */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-gray-800">
        {!isSidebarCollapsed && (
          <span className="font-semibold text-base">TaskiMoo</span>
        )}
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Workspace Selector */}
      {!isSidebarCollapsed && (
        <div className="p-2 border-b border-gray-800">
          <button className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded text-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-medium">
                {currentWorkspace?.name?.[0] || "W"}
              </div>
              <span className="truncate">
                {currentWorkspace?.name || "Select Workspace"}
              </span>
            </div>
            <Plus className="h-3 w-3 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Search */}
      {!isSidebarCollapsed && (
        <div className="p-2 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-7 pr-2 py-1.5 bg-gray-800 border-0 rounded text-sm placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 py-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-sm transition-colors relative",
                "hover:bg-gray-800",
                isActive && "bg-gray-800 text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
              )}
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-800 py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-sm transition-colors relative",
                "hover:bg-gray-800",
                isActive && "bg-gray-800 text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Menu */}
      <div className="border-t border-gray-800 p-2">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-800 rounded text-sm"
          >
            <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0" />
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <div className="text-xs font-medium truncate">John Doe</div>
                  <div className="text-xs text-gray-400 truncate">
                    john@example.com
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showUserMenu && "rotate-180"
                  )}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && !isSidebarCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
