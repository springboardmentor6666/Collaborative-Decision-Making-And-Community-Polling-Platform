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
    <div className="flex flex-col h-full bg-white p-4 border-r border-[#E2E8F0]">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#18181B] flex items-center justify-center text-white font-bold">
          D
        </div>
        <span className="font-bold text-lg hidden md:block">DecisionHub</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-[#18181B] text-white" 
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <>
            {ADMIN_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-[#18181B] text-white" 
                      : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
                  )
                }
              >
                <item.icon className="w-5 h-5 text-purple-400" />
                <span className="text-purple-600 font-bold">{item.name}</span>
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-[#18181B] text-white" 
                    : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
                )
              }
            >
              <ShieldAlert className="w-5 h-5 text-purple-500" />
              <span className="text-purple-600 font-bold">System Admin</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-[#E2E8F0]">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-[#18181B] text-white" 
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
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
