import React, { useState, useMemo } from 'react';
import { 
  useAllUsers, 
  useDeleteUser, 
  useUpdateUserStatus, 
  useCreateAdminUser, 
  useUpdateUserRole 
} from '../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Trash2, 
  ShieldAlert, 
  FileCheck, 
  UserPlus, 
  ShieldCheck, 
  MoreHorizontal, 
  Search, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Users, 
  Shield 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmDialogContext';
import { UserResponse } from '@/types';

export function UserManagementPage() {
  const { data, isLoading, error } = useAllUsers(0, 100);
  const deleteMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();
  const createAdminMutation = useCreateAdminUser();
  const updateRoleMutation = useUpdateUserRole();

  const { user: currentUser } = useAuth();
  const { confirm } = useConfirm();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER'>('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Selected User for actions
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Form states - Create Admin
  const [createForm, setCreateForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'ROLE_ADMIN' as 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER',
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Form states - Update Role
  const [selectedRole, setSelectedRole] = useState<'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER'>('ROLE_ADMIN');

  // Helper to generate secure random password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const users = data?.content || [];

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = u.fullName || '';
      const username = u.username || '';
      const email = u.email || '';
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'ROLE_ADMIN').length,
      moderators: users.filter((u) => u.role === 'ROLE_MODERATOR').length,
      active: users.filter((u) => (u.accountStatus || 'ACTIVE') === 'ACTIVE').length,
    };
  }, [users]);

  // Handlers
  const handleOpenCreateModal = () => {
    setCreateForm({
      fullName: '',
      username: '',
      email: '',
      password: generateSecurePassword(),
      role: 'ROLE_ADMIN',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.username.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await createAdminMutation.mutateAsync(createForm);
      toast.success(`Staff account @${createForm.username} created successfully!`);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create staff account.');
    }
  };

  const handleOpenRoleModal = (user: UserResponse) => {
    setSelectedUser(user);
    setSelectedRole((user.role as any) || 'ROLE_USER');
    setIsRoleModalOpen(true);
  };

  const handleUpdateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.userId === currentUser?.userId && selectedRole !== 'ROLE_ADMIN') {
      toast.error('You cannot remove your own Administrator role.');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId: selectedUser.userId,
        role: selectedRole,
      });
      toast.success(`Role for @${selectedUser.username} updated to ${selectedRole.replace('ROLE_', '')}`);
      setIsRoleModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleStatusChange = async (userId: number, username: string, currentStatus?: string) => {
    const status = currentStatus || 'ACTIVE';
    const newStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionName = newStatus === 'ACTIVE' ? 'Reactivate' : 'Suspend';

    const confirmed = await confirm({
      title: `${actionName} User Account`,
      message: `Are you sure you want to change the status of @${username} to ${newStatus}?`,
      confirmText: actionName,
      cancelText: 'Cancel',
      variant: newStatus === 'SUSPENDED' ? 'destructive' : 'default',
      icon: newStatus === 'SUSPENDED' ? 'user-x' : 'user-check',
      badgeText: `Account ${actionName}`,
      highlightContent: `@${username}`,
    });

    if (confirmed) {
      try {
        await updateStatusMutation.mutateAsync({
          userId,
          status: newStatus as any,
          reason: `Admin requested account ${newStatus.toLowerCase()}`,
        });
        toast.success(`Account @${username} is now ${newStatus}`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || `Failed to update status`);
      }
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    const confirmed = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete @${username}? This action cannot be undone.`,
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
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading users and credentials...</div>;
  if (error) return <div className="py-6 text-destructive text-center">Failed to load users.</div>;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      {/* Header & Main Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin & User Management</h1>
          <p className="text-muted-foreground mt-1">Manage platform staff accounts, assign roles, and audit security accounts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Staff / Admin
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <ShieldAlert className="mr-2 h-4 w-4 text-purple-500" />
              Reports
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-500" /> Total Accounts
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-500" /> Administrators
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-500" /> Moderators
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.moderators}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Active Users
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Account Roster</CardTitle>
              <CardDescription>Search, promote roles, and oversee account statuses across the platform.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={roleFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ALL')}
              className="h-8 text-xs"
            >
              All Users ({stats.total})
            </Button>
            <Button
              variant={roleFilter === 'ROLE_ADMIN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ROLE_ADMIN')}
              className="h-8 text-xs"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Administrators ({stats.admins})
            </Button>
            <Button
              variant={roleFilter === 'ROLE_MODERATOR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ROLE_MODERATOR')}
              className="h-8 text-xs"
            >
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Moderators ({stats.moderators})
            </Button>
            <Button
              variant={roleFilter === 'ROLE_USER' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ROLE_USER')}
              className="h-8 text-xs"
            >
              Standard Users ({stats.total - stats.admins - stats.moderators})
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No accounts found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.userId === u.userId;
                    const accountStatus = u.accountStatus || 'ACTIVE';
                    return (
                      <tr key={u.userId} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={u.profileImage} />
                              <AvatarFallback>{(u.fullName || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {u.fullName}
                                {isSelf && <Badge variant="secondary" className="text-[10px] py-0 px-1">You</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground">@{u.username} • {u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              u.role === 'ROLE_ADMIN' 
                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' 
                                : u.role === 'ROLE_MODERATOR'
                                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {u.role.replace('ROLE_', '')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              accountStatus === 'ACTIVE' 
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {accountStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Manage Account</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenRoleModal(u)}>
                                <ShieldCheck className="mr-2 h-4 w-4 text-purple-500" />
                                Change Role
                              </DropdownMenuItem>
                              {!isSelf && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStatusChange(u.userId, u.username, u.accountStatus)}>
                                    {accountStatus === 'ACTIVE' ? (
                                      <>
                                        <UserX className="mr-2 h-4 w-4 text-orange-500" />
                                        Suspend Account
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
                                        Activate Account
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onClick={() => handleDelete(u.userId, u.username)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Create Admin / Staff */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Administrator / Staff
            </DialogTitle>
            <DialogDescription>
              Create a new privileged account with assigned administrative permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdminSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-fullname">Full Name</Label>
              <Input
                id="create-fullname"
                placeholder="e.g. Jane Doe"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-username">Username</Label>
                <Input
                  id="create-username"
                  placeholder="e.g. jdoe_admin"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-role">Assigned Role</Label>
                <select
                  id="create-role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ROLE_ADMIN">Administrator (Full Access)</option>
                  <option value="ROLE_MODERATOR">Moderator (Content Oversight)</option>
                  <option value="ROLE_USER">Standard User</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email">Email Address</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="admin@decisionhub.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="create-password">Initial Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateForm({ ...createForm, password: generateSecurePassword() })}
                  className="h-6 text-xs text-primary px-2"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Generate Strong
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showCreatePassword ? 'text' : 'password'}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Change User Role */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-500" />
              Update Account Role
            </DialogTitle>
            <DialogDescription>
              Modify privileges for <strong className="text-foreground">@{selectedUser?.username}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateRoleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-select">Select New Role</Label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ROLE_ADMIN">ROLE_ADMIN (Full Platform Management)</option>
                <option value="ROLE_MODERATOR">ROLE_MODERATOR (Content & Abuse Reports)</option>
                <option value="ROLE_USER">ROLE_USER (Standard Member)</option>
              </select>
            </div>

            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              ⚠️ Note: Granting <strong>ROLE_ADMIN</strong> gives full privileges to manage staff accounts and inspect all system audit logs.
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? 'Saving...' : 'Save Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
