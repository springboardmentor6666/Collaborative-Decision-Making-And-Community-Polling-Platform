import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPreferences } from '@/types';
import { useUpdatePreferences } from '../hooks/useSettings';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { Sun, Moon, Laptop, Palette, LayoutGrid, Check } from 'lucide-react';
import { cn } from '@/utils';
import { toast } from 'sonner';

interface AppearanceSettingsTabProps {
  preferences?: UserPreferences;
}

export const AppearanceSettingsTab: React.FC<AppearanceSettingsTabProps> = ({ preferences }) => {
  const { theme: currentTheme, resolvedTheme, setTheme } = useTheme();
  const updatePrefsMutation = useUpdatePreferences();

  const [feedDensity, setFeedDensity] = useState<'comfortable' | 'compact'>(preferences?.feedDensity || 'comfortable');

  useEffect(() => {
    if (preferences?.feedDensity) {
      setFeedDensity(preferences.feedDensity);
    }
  }, [preferences]);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    updatePrefsMutation.mutate({ theme: newTheme });
    toast.success(`Theme switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
  };

  const handleSaveDensity = async () => {
    try {
      await updatePrefsMutation.mutateAsync({
        feedDensity,
      });
    } catch {
      // Handled in hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <span>Color Theme</span>
          </CardTitle>
          <CardDescription>
            Customize the look and feel of DecisionHub on your current device. Currently active: <strong className="capitalize">{resolvedTheme}</strong> mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Theme */}
            <div
              onClick={() => handleSelectTheme('light')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 relative space-y-3",
                currentTheme === 'light'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm">Light</h4>
                </div>
                {currentTheme === 'light' && (
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="p-2.5 rounded-md bg-white border border-neutral-200 text-neutral-800 space-y-1.5 pointer-events-none">
                <div className="w-16 h-2 bg-neutral-900 rounded-sm" />
                <div className="w-24 h-1.5 bg-neutral-300 rounded-sm" />
                <div className="w-full h-1 bg-neutral-200 rounded-sm" />
              </div>
            </div>

            {/* Dark Theme */}
            <div
              onClick={() => handleSelectTheme('dark')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 relative space-y-3",
                currentTheme === 'dark'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm">Dark</h4>
                </div>
                {currentTheme === 'dark' && (
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="p-2.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-100 space-y-1.5 pointer-events-none">
                <div className="w-16 h-2 bg-neutral-100 rounded-sm" />
                <div className="w-24 h-1.5 bg-neutral-700 rounded-sm" />
                <div className="w-full h-1 bg-neutral-800 rounded-sm" />
              </div>
            </div>

            {/* System Default */}
            <div
              onClick={() => handleSelectTheme('system')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 relative space-y-3",
                currentTheme === 'system'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm">System</h4>
                </div>
                {currentTheme === 'system' && (
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Mini Split Preview */}
              <div className="rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden flex h-11 pointer-events-none">
                <div className="w-1/2 bg-white p-2 space-y-1">
                  <div className="w-8 h-1.5 bg-neutral-900 rounded-sm" />
                  <div className="w-12 h-1 bg-neutral-300 rounded-sm" />
                </div>
                <div className="w-1/2 bg-neutral-950 p-2 space-y-1">
                  <div className="w-8 h-1.5 bg-neutral-100 rounded-sm" />
                  <div className="w-12 h-1 bg-neutral-700 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Density & Layout Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <span>Feed Density</span>
          </CardTitle>
          <CardDescription>
            Adjust how decisions and polls are rendered in your feeds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setFeedDensity('comfortable')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 space-y-2",
                feedDensity === 'comfortable'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Comfortable</h4>
                {feedDensity === 'comfortable' && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Spacious layout displaying vote progress bars, user avatars, and discussion summaries.
              </p>
            </div>

            <div
              onClick={() => setFeedDensity('compact')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 space-y-2",
                feedDensity === 'compact'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Compact</h4>
                {feedDensity === 'compact' && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Condensed row list allowing fast scanning through high-volume community decision streams.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-3">
          <Button
            onClick={handleSaveDensity}
            disabled={updatePrefsMutation.isPending}
          >
            {updatePrefsMutation.isPending ? 'Saving...' : 'Save Display Settings'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
