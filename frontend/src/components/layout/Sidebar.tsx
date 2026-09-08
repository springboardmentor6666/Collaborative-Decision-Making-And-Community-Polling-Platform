import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckSquare, 
  Bell, 
  BarChart, 
  FileText,
  User,
  Settings,
  Globe,
  Bookmark,
  FileEdit,
  Activity,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Discover Communities", href: "/communities", icon: Globe },
  { name: "My Communities", href: "/communities/my", icon: Users },
  { name: "Decisions", href: "/decisions", icon: Target },
  { name: "My Decisions", href: "/decisions/my", icon: FileEdit },
  { name: "Saved Decisions", href: "/saved", icon: Bookmark },
  { name: "My Votes", href: "/votes/my", icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Activity", href: "/activity", icon: Activity },
];

const ADMIN_ITEMS = [
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Reports", href: "/reports", icon: FileText },
];

const BOTTOM_ITEMS = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/profile/settings", icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground p-4 border-r border-border">
      <div className="flex items-center gap-2.5 px-2 py-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
          D
        </div>
        <span className="font-bold text-lg text-foreground hidden md:block tracking-tight">
          DecisionHub
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admin</span>
            </div>
            {ADMIN_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-purple-600 text-white font-semibold shadow-xs" 
                      : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold">{item.name}</span>
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-purple-600 text-white font-semibold shadow-xs" 
                    : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                )
              }
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="font-bold">Report Management</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto space-y-1 pt-4 border-t border-border">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
