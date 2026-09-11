import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserPreferences } from '@/types';
import { useUpdatePreferences } from '../hooks/useSettings';
import { 
  Bell, 
  Mail, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Award, 
  Sparkles
} from 'lucide-react';
import { HikeIcon } from '@/components/icons/HikeIcon';
import { toast } from 'sonner';

interface NotificationSettingsTabProps {
  preferences?: UserPreferences;
}

export const NotificationSettingsTab: React.FC<NotificationSettingsTabProps> = ({ preferences }) => {
  const updatePrefsMutation = useUpdatePreferences();

  const [inAppNotifications, setInAppNotifications] = useState(preferences?.inAppNotifications ?? true);
  const [emailDigest, setEmailDigest] = useState<'INSTANT' | 'DAILY' | 'WEEKLY' | 'OFF'>(preferences?.emailDigest || 'DAILY');
  const [notifyNewDecisions, setNotifyNewDecisions] = useState(preferences?.notifyNewDecisions ?? true);
  const [notifyVoteDeadlines, setNotifyVoteDeadlines] = useState(preferences?.notifyVoteDeadlines ?? true);
  const [notifyDecisionResults, setNotifyDecisionResults] = useState(preferences?.notifyDecisionResults ?? true);
  const [notifyCommentsAndMentions, setNotifyCommentsAndMentions] = useState(preferences?.notifyCommentsAndMentions ?? true);
  const [notifyHikes, setNotifyHikes] = useState(preferences?.notifyHikes ?? true);
  const [notifyElections, setNotifyElections] = useState(preferences?.notifyElections ?? true);

  useEffect(() => {
    if (preferences) {
      setInAppNotifications(preferences.inAppNotifications);
      setEmailDigest(preferences.emailDigest);
      setNotifyNewDecisions(preferences.notifyNewDecisions);
      setNotifyVoteDeadlines(preferences.notifyVoteDeadlines);
      setNotifyDecisionResults(preferences.notifyDecisionResults);
      setNotifyCommentsAndMentions(preferences.notifyCommentsAndMentions);
      setNotifyHikes(preferences.notifyHikes ?? true);
      setNotifyElections(preferences.notifyElections);
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await updatePrefsMutation.mutateAsync({
        inAppNotifications,
        emailDigest,
        notifyNewDecisions,
        notifyVoteDeadlines,
        notifyDecisionResults,
        notifyCommentsAndMentions,
        notifyHikes,
        notifyElections,
      });
    } catch {
      // Handled in hook
    }
  };

  const handleSelectAll = (enable: boolean) => {
    setNotifyNewDecisions(enable);
    setNotifyVoteDeadlines(enable);
    setNotifyDecisionResults(enable);
    setNotifyCommentsAndMentions(enable);
    setNotifyHikes(enable);
    setNotifyElections(enable);
    toast.info(enable ? 'All event notifications enabled' : 'All event notifications disabled');
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Delivery Channels</span>
          </CardTitle>
          <CardDescription>
            Choose how you would like DecisionHub to reach you with platform activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="inAppToggle" className="font-semibold text-sm cursor-pointer">
                  In-App Notification Feed
                </Label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Receive badge alerts and real-time popups on the top navigation bar.
              </p>
            </div>
            <Switch
              id="inAppToggle"
              checked={inAppNotifications}
              onCheckedChange={setInAppNotifications}
            />
          </div>

          <div className="p-3.5 border rounded-lg bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="emailDigestSelect" className="font-semibold text-sm">
                Email Summary & Digests
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure how frequently you receive email updates regarding votes and discussions.
            </p>
            <select
              id="emailDigestSelect"
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value as any)}
              className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="INSTANT">Instant (Real-time email for every major event)</option>
              <option value="DAILY">Daily Digest (Once a day overview of community activity)</option>
              <option value="WEEKLY">Weekly Summary (Weekly highlights & active polls)</option>
              <option value="OFF">Turn off all email notifications</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Decision-Specific Notification Events */}
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Event Subscriptions</span>
            </CardTitle>
            <CardDescription>
              Fine-tune alerts for polls, community decisions, and elections.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSelectAll(true)}
              className="text-xs h-7 px-2"
            >
              Enable All
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSelectAll(false)}
              className="text-xs h-7 px-2 text-muted-foreground"
            >
              Disable All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {/* New Decisions */}
          <div className="flex items-center justify-between py-3.5">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="notifyNewDecisions" className="text-sm font-medium cursor-pointer">
                New Decisions & Polls
              </Label>
              <p className="text-xs text-muted-foreground">
                Alert me whenever a new decision board is published in my joined communities.
              </p>
            </div>
            <Switch
              id="notifyNewDecisions"
              checked={notifyNewDecisions}
              onCheckedChange={setNotifyNewDecisions}
            />
          </div>

          {/* Vote Deadlines */}
          <div className="flex items-center justify-between py-3.5">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <Label htmlFor="notifyVoteDeadlines" className="text-sm font-medium cursor-pointer">
                  Approaching Vote Deadlines
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Send 24-hour and 1-hour countdown reminders for polls you have not yet voted on.
              </p>
            </div>
            <Switch
              id="notifyVoteDeadlines"
              checked={notifyVoteDeadlines}
              onCheckedChange={setNotifyVoteDeadlines}
            />
          </div>

          {/* Concluded Results */}
          <div className="flex items-center justify-between py-3.5">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <Label htmlFor="notifyDecisionResults" className="text-sm font-medium cursor-pointer">
                  Poll Outcomes & Final Results
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Notify me when voting concludes and the final outcome of a decision is published.
              </p>
            </div>
            <Switch
              id="notifyDecisionResults"
              checked={notifyDecisionResults}
              onCheckedChange={setNotifyDecisionResults}
            />
          </div>

          {/* Comments and Mentions */}
          <div className="flex items-center justify-between py-3.5">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <Label htmlFor="notifyCommentsAndMentions" className="text-sm font-medium cursor-pointer">
                  Comments & Mentions
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Notify me when someone replies to my proposals, comments on my posts, or mentions @myusername.
              </p>
            </div>
            <Switch
              id="notifyCommentsAndMentions"
              checked={notifyCommentsAndMentions}
              onCheckedChange={setNotifyCommentsAndMentions}
            />
          </div>

          {/* Decision Hikes */}
          <div className="flex items-center justify-between py-3.5">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <HikeIcon hiked={true} className="w-3.5 h-3.5 text-emerald-500" />
                <Label htmlFor="notifyHikes" className="text-sm font-medium cursor-pointer">
                  Decision Hikes
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert me whenever someone hikes one of my decision boards or proposals.
              </p>
            </div>
            <Switch
              id="notifyHikes"
              checked={notifyHikes}
              onCheckedChange={setNotifyHikes}
            />
          </div>

          {/* Community Elections */}
          <div className="flex items-center justify-between py-3.5">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-purple-500" />
                <Label htmlFor="notifyElections" className="text-sm font-medium cursor-pointer">
                  Community Leadership Elections
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Receive updates on nominee submissions, voting opening, and election winners.
              </p>
            </div>
            <Switch
              id="notifyElections"
              checked={notifyElections}
              onCheckedChange={setNotifyElections}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-3">
          <Button
            onClick={handleSave}
            disabled={updatePrefsMutation.isPending}
          >
            {updatePrefsMutation.isPending ? 'Saving Preferences...' : 'Save Notification Preferences'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
