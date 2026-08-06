import React from 'react';
import { usePendingRequests, useApproveRequest, useRejectRequest } from '../hooks/useCommunityAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';

export function PendingRequestsList({ communityId }: { communityId: number }) {
  const { data, isLoading, error } = usePendingRequests(communityId);
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading pending requests...</div>;
  
  if (error) return <div className="py-4 text-destructive">Failed to load pending requests.</div>;

  const requests = data?.content || [];

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending join requests at this time.
        </CardContent>
      </Card>
    );
  }

  const handleApprove = async (userId: number) => {
    try {
      await approveMutation.mutateAsync({ communityId, userId });
      toast.success('Join request approved');
    } catch {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectMutation.mutateAsync({ communityId, userId });
      toast.success('Join request rejected');
    } catch {
      toast.error('Failed to reject request');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Join Requests</CardTitle>
        <CardDescription>Review and approve new members who wish to join.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.memberId} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={request.user.profileImage} />
                  <AvatarFallback>{request.user.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleApprove(request.user.userId)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => handleReject(request.user.userId)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
