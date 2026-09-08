import React from 'react';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Vote, 
  Palette, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/utils';

export type SettingsTabId = 'account' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'danger';

interface SettingsNavProps {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
}

interface NavItem {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  danger?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'account',
    label: 'Profile & Account',
    description: 'Personal info, email & timezone',
    icon: User,
  },
  {
    id: 'security',
    label: 'Security & Access',
    description: 'Password & active sessions',
    icon: ShieldCheck,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Decision alerts & email digests',
    icon: Bell,
  },
  {
    id: 'privacy',
    label: 'Voting & Privacy',
    description: 'Voting anonymity & data export',
    icon: Vote,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Themes & interface display',
    icon: Palette,
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    description: 'Deactivation & account deletion',
    icon: AlertTriangle,
    danger: true,
  },
];

export const SettingsNav: React.FC<SettingsNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="flex flex-col space-y-1 w-full lg:w-64 shrink-0" aria-label="Settings navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-lg text-left text-sm font-medium transition-all duration-150 group",
              isActive
                ? item.danger
                  ? "bg-destructive/10 text-destructive font-semibold shadow-xs"
                  : "bg-primary text-primary-foreground font-semibold shadow-xs"
                : item.danger
                ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isActive
                  ? item.danger
                    ? "bg-destructive/20 text-destructive"
                    : "bg-primary-foreground/15 text-primary-foreground"
                  : item.danger
                  ? "bg-destructive/5 text-destructive/80 group-hover:bg-destructive/20 group-hover:text-destructive"
                  : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-[11px] truncate hidden md:block",
                  isActive
                    ? item.danger
                      ? "text-destructive/80"
                      : "text-primary-foreground/75"
                    : "text-muted-foreground/70"
                )}
              >
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
