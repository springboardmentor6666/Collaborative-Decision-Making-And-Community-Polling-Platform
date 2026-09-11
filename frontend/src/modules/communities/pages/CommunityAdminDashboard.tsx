import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PendingRequestsList } from '../components/PendingRequestsList';
import { MemberManagement } from '../components/MemberManagement';
import { AbuseReportsList } from '../components/AbuseReportsList';
import { AdminElectionsList } from '../../elections/components/AdminElectionsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { useInviteUser } from '../hooks/useCommunityAdmin';
import { toast } from 'sonner';

export default function CommunityAdminDashboard() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || '0', 10);
  
  const [username, setUsername] = useState('');
  const inviteMutation = useInviteUser();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) return;
    try {
      const res = await inviteMutation.mutateAsync({ communityId, username: cleanUsername });
      toast.success(`@${res.user?.username || cleanUsername} invited and added successfully!`);
      setUsername('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to invite user. Please verify the username.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/communities/${communityId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-1">Community Administration</h1>
          <p className="text-muted-foreground">Manage members, roles, and settings.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <AdminElectionsList communityId={communityId} />
          <PendingRequestsList communityId={communityId} />
          <AbuseReportsList communityId={communityId} />
          <MemberManagement communityId={communityId} />
        </div>
        
        <div className="space-y-8">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-foreground">Invite Member</CardTitle>
              <CardDescription className="text-muted-foreground">Invite a user to join this community by their username.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">@</span>
                    <Input 
                      placeholder="username (e.g. johndoe)" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      className="pl-7 bg-background border-border text-foreground focus-visible:ring-blue-500"
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Enter member's exact username or email address</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20" 
                  disabled={inviteMutation.isPending || !username.trim()}
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
