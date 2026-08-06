import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useDeleteAccount } from '../hooks/useProfile';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const deleteMutation = useDeleteAccount();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account.')) {
      try {
        await deleteMutation.mutateAsync();
        toast.success('Account deleted successfully');
        // Will be redirected to login via auth context usually or we can force it
        window.location.href = '/login';
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.info('Password change coming soon'); }}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">Permanently remove your account and all associated data.</p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
