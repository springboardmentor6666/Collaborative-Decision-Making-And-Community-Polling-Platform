import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PendingRequestsList } from '../components/PendingRequestsList';
import { MemberManagement } from '../components/MemberManagement';
import { AbuseReportsList } from '../components/AbuseReportsList';
import { AdminElectionsList } from '../../elections/components/AdminElectionsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useInviteUser } from '../hooks/useCommunityAdmin';
import { toast } from 'sonner';

export default function CommunityAdminDashboard() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || '0', 10);
  
  const [inviteId, setInviteId] = useState('');
  const inviteMutation = useInviteUser();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) return;
    try {
      await inviteMutation.mutateAsync({ communityId, userId: parseInt(inviteId, 10) });
      toast.success('User invited successfully');
      setInviteId('');
    } catch {
      toast.error('Failed to invite user. Make sure the ID is correct.');
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
          <Card>
            <CardHeader>
              <CardTitle>Invite Member</CardTitle>
              <CardDescription>Invite a user to join this community by their ID.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <Input 
                  placeholder="User ID (e.g. 5)" 
                  value={inviteId} 
                  onChange={(e) => setInviteId(e.target.value)}
                  type="number"
                  min="1"
                />
                <Button type="submit" className="w-full" disabled={inviteMutation.isPending || !inviteId}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
