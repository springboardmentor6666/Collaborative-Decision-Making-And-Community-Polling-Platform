import React, { useState } from 'react';
import { useSubmitNominee } from '../hooks/useElections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface NomineeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
}

export function NomineeFormModal({ isOpen, onClose, categoryId }: NomineeFormModalProps) {
  const submitMutation = useSubmitNominee();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error('Please fill out the name and description.');
      return;
    }

    submitMutation.mutate({
      categoryId,
      data: {
        name,
        description,
        imageUrl: imageUrl || undefined,
      },
    }, {
      onSuccess: () => {
        toast.success('Nominee added successfully!');
        setName('');
        setDescription('');
        setImageUrl('');
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add nominee.');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Nominee</DialogTitle>
          <DialogDescription>
            Submit a new nominee for this category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nominee Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe, Cyberpunk 2077" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why are they being nominated?" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL (Optional)</label>
            <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit Nominee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
