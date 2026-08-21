import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityElections, useDeleteElection } from '../hooks/useElections';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Calendar, Settings, Trash2 } from 'lucide-react';
import { CreateElectionModal } from './CreateElectionModal';
import { toast } from 'sonner';

export function AdminElectionsList({ communityId }: { communityId: number }) {
  const { data: elections, isLoading } = useCommunityElections(communityId);
  const deleteMutation = useDeleteElection();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = (eventId: number) => {
    if (confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      deleteMutation.mutate(eventId, {
        onSuccess: () => toast.success("Election deleted successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete election")
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Voting Events (Elections)</CardTitle>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Election
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : !elections || elections.length === 0 ? (
          <p className="text-center text-muted-foreground p-4">No voting events found.</p>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => (
              <div key={election.eventId} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{election.title}</h3>
                    <Badge variant={election.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {election.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(election.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/communities/${communityId}/admin/elections/${election.eventId}`}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Link>
                  </Button>
                  {(election.status !== 'ACTIVE' && election.status !== 'UPCOMING') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(election.eventId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CreateElectionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        communityId={communityId} 
      />
    </Card>
  );
}
