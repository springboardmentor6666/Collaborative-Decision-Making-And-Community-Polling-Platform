import React from 'react';
import { useCommunityMembers, useUpdateMemberRole, useRemoveMember } from '../hooks/useCommunityAdmin';
import { MemberRole } from '../types/community';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';
import { MoreVertical, ShieldAlert, UserX, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MemberManagement({ communityId }: { communityId: number }) {
  const { user: currentUser } = useAuth();
  const { data, isLoading, error } = useCommunityMembers(communityId, 0, 100);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading members...</div>;
  if (error) return <div className="py-4 text-destructive">Failed to load members.</div>;

  const members = data?.content || [];

  const handleUpdateRole = async (userId: number, role: MemberRole) => {
    try {
      await updateRoleMutation.mutateAsync({ communityId, userId, role });
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (userId: number) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMutation.mutateAsync({ communityId, userId });
        toast.success('Member removed');
      } catch {
        toast.error('Failed to remove member');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Management</CardTitle>
        <CardDescription>Manage community members and roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.memberId} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.user.profileImage} />
                  <AvatarFallback>{member.user.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.user.fullName}</p>
                    {member.memberRole === 'OWNER' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Owner</span>}
                    {member.memberRole === 'MODERATOR' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Mod</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">@{member.user.username}</p>
                </div>
              </div>
              
              {currentUser?.userId !== member.user.userId && member.memberRole !== 'OWNER' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {member.memberRole !== 'MODERATOR' && (
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.user.userId, 'MODERATOR')}>
                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
                        Promote to Mod
                      </DropdownMenuItem>
                    )}
                    {member.memberRole === 'MODERATOR' && (
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.user.userId, 'MEMBER')}>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Demote to Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleRemove(member.user.userId)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Remove from Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
