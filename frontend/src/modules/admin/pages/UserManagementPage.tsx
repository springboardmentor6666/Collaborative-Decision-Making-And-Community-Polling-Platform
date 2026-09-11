import React from 'react';
import { useAllUsers, useDeleteUser } from '../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Activity, ShieldAlert, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmDialogContext';

export function UserManagementPage() {
  const { data, isLoading, error } = useAllUsers(0, 100);
  const deleteMutation = useDeleteUser();
  const { user: currentUser } = useAuth();
  const { confirm } = useConfirm();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading users...</div>;
  if (error) return <div className="py-4 text-destructive">Failed to load users.</div>;

  const users = data?.content || [];

  const handleDelete = async (userId: number, username: string) => {
    const confirmed = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete @${username}? This action will permanently remove their profile, decision boards, and community memberships.`,
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      variant: 'destructive',
      icon: 'user-x',
      badgeText: 'Admin Account Deletion',
      highlightContent: `Account: @${username} (User ID: ${userId})`,
    });

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(userId);
        toast.success(`User @${username} deleted successfully`);
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users on the platform.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <ShieldAlert className="mr-2 h-4 w-4 text-purple-500" />
              Report Management
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/audit-logs">
              <FileCheck className="mr-2 h-4 w-4" />
              Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Users ({data?.totalElements || 0})</CardTitle>
          <CardDescription>Comprehensive list of all accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.profileImage} />
                          <AvatarFallback>{u.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">@{u.username} • {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currentUser?.userId !== u.userId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(u.userId, u.username)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
