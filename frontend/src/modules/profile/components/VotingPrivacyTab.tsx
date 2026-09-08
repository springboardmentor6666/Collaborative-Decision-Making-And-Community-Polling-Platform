import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserPreferences } from '@/types';
import { useUpdatePreferences, useExportUserData } from '../hooks/useSettings';
import { 
  Vote, 
  Eye, 
  EyeOff, 
  Download, 
  ShieldCheck, 
  Award, 
  FileJson, 
  Lock 
} from 'lucide-react';
import { cn } from '@/utils';

interface VotingPrivacyTabProps {
  preferences?: UserPreferences;
}

export const VotingPrivacyTab: React.FC<VotingPrivacyTabProps> = ({ preferences }) => {
  const updatePrefsMutation = useUpdatePreferences();
  const exportDataMutation = useExportUserData();

  const [defaultVotingMode, setDefaultVotingMode] = useState<'PUBLIC' | 'ANONYMOUS'>(preferences?.defaultVotingMode || 'PUBLIC');
  const [activityVisibility, setActivityVisibility] = useState<'PUBLIC' | 'COMMUNITY_ONLY' | 'PRIVATE'>(preferences?.activityVisibility || 'PUBLIC');
  const [showBadges, setShowBadges] = useState(preferences?.showBadges ?? true);

  useEffect(() => {
    if (preferences) {
      setDefaultVotingMode(preferences.defaultVotingMode);
      setActivityVisibility(preferences.activityVisibility);
      setShowBadges(preferences.showBadges);
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await updatePrefsMutation.mutateAsync({
        defaultVotingMode,
        activityVisibility,
        showBadges,
      });
    } catch {
      // Handled in hook
    }
  };

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Default Voting Mode Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Vote className="w-5 h-5 text-primary" />
            <span>Default Voting Mode</span>
          </CardTitle>
          <CardDescription>
            Choose your default identity preference when participating in polls and community votes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Public Option */}
            <div
              onClick={() => setDefaultVotingMode('PUBLIC')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 relative flex flex-col justify-between space-y-3",
                defaultVotingMode === 'PUBLIC'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-2 rounded-lg", defaultVotingMode === 'PUBLIC' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Public Voting</h4>
                    <span className="text-[11px] text-muted-foreground">Standard</span>
                  </div>
                </div>
                {defaultVotingMode === 'PUBLIC' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your profile handle and avatar are visible in the list of participants who cast votes on decisions.
              </p>
            </div>

            {/* Anonymous Option */}
            <div
              onClick={() => setDefaultVotingMode('ANONYMOUS')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 relative flex flex-col justify-between space-y-3",
                defaultVotingMode === 'ANONYMOUS'
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-muted-foreground/40 bg-card"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-2 rounded-lg", defaultVotingMode === 'ANONYMOUS' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Anonymous Voting</h4>
                    <span className="text-[11px] text-muted-foreground">Private identity</span>
                  </div>
                </div>
                {defaultVotingMode === 'ANONYMOUS' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your vote contributes to the total count, but your identity is masked and never shown to other members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile & Timeline Visibility */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>Profile & Activity Privacy</span>
          </CardTitle>
          <CardDescription>
            Control who can view your past voting history and community activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="activityVisibility" className="text-sm font-medium">
              Activity Timeline Visibility
            </Label>
            <select
              id="activityVisibility"
              value={activityVisibility}
              onChange={(e) => setActivityVisibility(e.target.value as any)}
              className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="PUBLIC">Public (Visible to everyone on DecisionHub)</option>
              <option value="COMMUNITY_ONLY">Community Members Only (Visible only to members of your communities)</option>
              <option value="PRIVATE">Private (Only visible to you)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <Label htmlFor="showBadges" className="text-sm font-medium cursor-pointer">
                  Display Community Badges & Moderator Roles
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Show recognized roles (Owner, Moderator, Top Contributor) alongside your name on public posts.
              </p>
            </div>
            <Switch
              id="showBadges"
              checked={showBadges}
              onCheckedChange={setShowBadges}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-3">
          <Button
            onClick={handleSave}
            disabled={updatePrefsMutation.isPending}
          >
            {updatePrefsMutation.isPending ? 'Saving Privacy Settings...' : 'Save Privacy Settings'}
          </Button>
        </CardFooter>
      </Card>

      {/* Data Portability / Export */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            <span>Data Portability & Export (GDPR)</span>
          </CardTitle>
          <CardDescription>
            Download a complete machine-readable copy of your personal DecisionHub profile, settings, and voting statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-semibold">Export Account Archive</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes your profile info, community memberships, created decisions, and configuration preferences as a structured JSON file.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportData}
              disabled={exportDataMutation.isPending}
              className="gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{exportDataMutation.isPending ? 'Generating...' : 'Download My Data (.JSON)'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
