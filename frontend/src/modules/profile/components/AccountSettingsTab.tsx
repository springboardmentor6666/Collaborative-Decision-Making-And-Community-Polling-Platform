import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserResponse, UserPreferences } from '@/types';
import { useUpdatePreferences } from '../hooks/useSettings';
import { useUpdateProfile } from '../hooks/useProfile';
import { CheckCircle2, Globe, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface AccountSettingsTabProps {
  user: UserResponse;
  preferences?: UserPreferences;
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New York (EST/EDT - UTC-5/UTC-4)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT - UTC-6/UTC-5)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT - UTC-7/UTC-6)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT - UTC-8/UTC-7)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST - UTC+0/UTC+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST - UTC+1/UTC+2)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST - UTC+1/UTC+2)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST - UTC+4)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST - UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT - UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST - UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT - UTC+10/UTC+11)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT - UTC+12/UTC+13)' },
];

export const AccountSettingsTab: React.FC<AccountSettingsTabProps> = ({ user, preferences }) => {
  const updateProfileMutation = useUpdateProfile();
  const updatePrefsMutation = useUpdatePreferences();

  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [timezone, setTimezone] = useState(preferences?.timezone || 'UTC');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (preferences?.timezone) {
      setTimezone(preferences.timezone);
    }
  }, [preferences]);

  const handleAutoDetectTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
      toast.info(`Detected timezone: ${detected}`);
    } catch {
      toast.error('Unable to auto-detect timezone.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        fullName,
        phone,
      });
      await updatePrefsMutation.mutateAsync({
        timezone,
      });
      toast.success('Account information updated successfully');
    } catch {
      // errors handled by mutation
    }
  };

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.username.slice(0, 2).toUpperCase();

  const isSaving = updateProfileMutation.isPending || updatePrefsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border shadow-xs">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                {user.profileImage && <AvatarImage src={user.profileImage} alt={user.fullName} />}
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold">{user.fullName || user.username}</h3>
                  <Badge variant="secondary" className="text-xs font-medium">
                    @{user.username}
                  </Badge>
                  {user.role && (
                    <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/profile/edit">
                <span>Edit Full Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Account Info Form */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Account Details</span>
          </CardTitle>
          <CardDescription>
            Update your primary account identity and contact information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user.username}
                  disabled
                  className="bg-muted cursor-not-allowed opacity-80"
                />
                <p className="text-[11px] text-muted-foreground">Usernames are unique across DecisionHub and cannot be changed.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email Address</Label>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted cursor-not-allowed opacity-80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Timezone and Localization */}
            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="timezone" className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Timezone & Deadline Calculation</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Poll countdown timers, election deadlines, and notifications will synchronize with this timezone.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoDetectTimezone}
                  className="text-xs h-8 gap-1.5 text-primary hover:text-primary"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Auto-Detect
                </Button>
              </div>

              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Account Settings'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
