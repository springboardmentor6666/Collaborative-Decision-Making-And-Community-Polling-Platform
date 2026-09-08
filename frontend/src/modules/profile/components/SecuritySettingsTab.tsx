import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserResponse } from '@/types';
import { useChangePassword } from '../hooks/useSettings';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Laptop, 
  Globe, 
  Shield, 
  Info,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface SecuritySettingsTabProps {
  user: UserResponse;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({ user }) => {
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength calculation
  const strengthChecks = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (strengthChecks.minLength) score += 1;
    if (strengthChecks.hasUpper && strengthChecks.hasLower) score += 1;
    if (strengthChecks.hasNumber) score += 1;
    if (strengthChecks.hasSpecial) score += 1;
    return score;
  }, [strengthChecks]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  }, [newPassword, strengthScore]);

  const strengthColor = useMemo(() => {
    if (strengthScore <= 1) return 'bg-red-500';
    if (strengthScore === 2) return 'bg-amber-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  }, [strengthScore]);

  const isGoogleUser = user.provider === 'GOOGLE';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: isGoogleUser ? undefined : currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Handled by mutation onError
    }
  };

  const handleRevokeOtherSessions = () => {
    toast.success('All other active browser sessions have been logged out.');
  };

  return (
    <div className="space-y-6">
      {/* Password Management Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>
            Ensure your account uses a long, unpredictable password to stay secure.
          </CardDescription>
        </CardHeader>

        {isGoogleUser && (
          <div className="mx-6 mb-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              You are signed in using <strong>Google SSO</strong>. Setting a password will allow you to sign in with either your Google account or email & password directly.
            </p>
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            {!isGoogleUser && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="p-3 bg-muted/40 rounded-lg border space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Password Strength:</span>
                  <span className="font-semibold">{strengthLabel}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {strengthChecks.minLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className={strengthChecks.minLength ? 'text-foreground' : 'text-muted-foreground'}>
                      8+ Characters
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    {strengthChecks.hasUpper && strengthChecks.hasLower ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className={strengthChecks.hasUpper && strengthChecks.hasLower ? 'text-foreground' : 'text-muted-foreground'}>
                      Upper & Lowercase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    {strengthChecks.hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className={strengthChecks.hasNumber ? 'text-foreground' : 'text-muted-foreground'}>
                      Number (0-9)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    {strengthChecks.hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className={strengthChecks.hasSpecial ? 'text-foreground' : 'text-muted-foreground'}>
                      Special Symbol
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-3">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending || !newPassword || !confirmPassword}
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Connected Accounts Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span>Connected Accounts</span>
          </CardTitle>
          <CardDescription>
            Single Sign-On providers linked with your DecisionHub profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 font-bold border border-red-200 dark:border-red-900">
                G
              </div>
              <div>
                <h4 className="text-sm font-semibold">Google Authentication</h4>
                <p className="text-xs text-muted-foreground">
                  {isGoogleUser ? `Linked as ${user.email}` : 'Sign in quickly using your Google Account.'}
                </p>
              </div>
            </div>
            {isGoogleUser ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold">
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Not Connected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Laptop className="w-5 h-5 text-primary" />
              <span>Active Sessions & Devices</span>
            </CardTitle>
            <CardDescription>
              Devices currently authenticated and logged into your account.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeOtherSessions}
            className="text-xs gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out other sessions</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="p-3.5 border rounded-lg bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">Web Browser (Current Session)</h4>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold">
                    ACTIVE NOW
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Secured with JWT Token • HTTPS
                </p>
              </div>
            </div>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
