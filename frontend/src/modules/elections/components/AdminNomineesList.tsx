import React, { useState } from 'react';
import { useCategoryNominees, useApproveNomination, useRejectNomination } from '../hooks/useElections';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, User, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { NomineeFormModal } from './NomineeFormModal';

export function AdminNomineesList({ categoryId }: { categoryId: number }) {
  const { data: nominees, isLoading } = useCategoryNominees(categoryId);
  const approveMutation = useApproveNomination();
  const rejectMutation = useRejectNomination();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApprove = (nomineeId: number) => {
    approveMutation.mutate({ categoryId, nomineeId }, {
      onSuccess: () => toast.success('Nomination approved'),
      onError: () => toast.error('Failed to approve nomination')
    });
  };

  const handleReject = (nomineeId: number) => {
    rejectMutation.mutate({ categoryId, nomineeId }, {
      onSuccess: () => toast.success('Nomination rejected'),
      onError: () => toast.error('Failed to reject nomination')
    });
  };

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Nominees</h4>
        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Nominee
        </Button>
      </div>

      {!nominees || nominees.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 text-center border rounded-md border-dashed bg-slate-50">No nominees yet.</p>
      ) : (
        <div className="space-y-4">
          {nominees.map((nominee) => (
            <div key={nominee.nomineeId} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-md gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full">
                  {nominee.imageUrl ? (
                    <img src={nominee.imageUrl} alt={nominee.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{nominee.name}</h4>
                  <p className="text-sm text-muted-foreground">{nominee.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  nominee.nominationStatus === 'APPROVED' ? 'default' : 
                  nominee.nominationStatus === 'PENDING' ? 'outline' : 'destructive'
                }>
                  {nominee.nominationStatus}
                </Badge>
                {nominee.nominationStatus === 'PENDING' && (
                  <>
                    <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(nominee.nomineeId)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(nominee.nomineeId)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NomineeFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categoryId={categoryId} 
      />
    </div>
  );
}
