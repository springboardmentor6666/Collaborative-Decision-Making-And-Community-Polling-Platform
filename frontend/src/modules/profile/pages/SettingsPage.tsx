import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useUserPreferences } from '../hooks/useSettings';
import { SettingsNav, SettingsTabId } from '../components/SettingsNav';
import { AccountSettingsTab } from '../components/AccountSettingsTab';
import { SecuritySettingsTab } from '../components/SecuritySettingsTab';
import { NotificationSettingsTab } from '../components/NotificationSettingsTab';
import { VotingPrivacyTab } from '../components/VotingPrivacyTab';
import { AppearanceSettingsTab } from '../components/AppearanceSettingsTab';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Sliders } from 'lucide-react';

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as SettingsTabId) || 'account';

  const { data: user, isLoading: isUserLoading, error: userError } = useProfile();
  const { data: preferences } = useUserPreferences();

  const handleSelectTab = (tab: SettingsTabId) => {
    setSearchParams({ tab });
  };

  if (isUserLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-destructive">Failed to load account settings</h2>
        <p className="text-muted-foreground mt-2">Please refresh the page or try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 md:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account & System Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-10">
            Manage your personal profile, credentials, notifications, voting privacy, and appearance.
          </p>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Sub-Navigation Sidebar */}
        <SettingsNav activeTab={currentTab} onSelectTab={handleSelectTab} />

        {/* Tab Content Panel */}
        <main className="flex-1 w-full min-w-0">
          {currentTab === 'account' && (
            <AccountSettingsTab user={user} preferences={preferences} />
          )}

          {currentTab === 'security' && (
            <SecuritySettingsTab user={user} />
          )}

          {currentTab === 'notifications' && (
            <NotificationSettingsTab preferences={preferences} />
          )}

          {currentTab === 'privacy' && (
            <VotingPrivacyTab preferences={preferences} />
          )}

          {currentTab === 'appearance' && (
            <AppearanceSettingsTab preferences={preferences} />
          )}

          {currentTab === 'danger' && (
            <div className="space-y-6">
              <Card className="border-destructive/40 shadow-xs bg-destructive/[0.02]">
                <CardHeader>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <CardTitle className="text-lg font-bold">Danger Zone</CardTitle>
                  </div>
                  <CardDescription className="text-destructive/80">
                    Irreversible and destructive actions regarding your personal data and platform presence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-background">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Permanently Delete Account</h4>
                      <p className="text-xs text-muted-foreground max-w-md">
                        Once deleted, your profile details, session tokens, and personal records are permanently erased. Your past votes will be anonymized.
                      </p>
                    </div>
                    <DeleteAccountDialog />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
