import React, { useState } from 'react';
import { useCreateElection } from '../hooks/useElections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CreateElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: number;
}

export function CreateElectionModal({ isOpen, onClose, communityId }: CreateElectionModalProps) {
  const createMutation = useCreateElection();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [resultsVisible, setResultsVisible] = useState<string>('RESULTS_HIDDEN_DURING_VOTING');
  const [votingType, setVotingType] = useState<string>('MULTIPLE');
  const [anonymousVoting, setAnonymousVoting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      toast.error('Please fill out all fields including dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error('End date must be after start date.');
      return;
    }

    createMutation.mutate({
      communityId,
      data: {
        title,
        description,
        startDate: startDate.length === 16 ? `${startDate}:00` : startDate,
        endDate: endDate.length === 16 ? `${endDate}:00` : endDate,
        resultsVisible: resultsVisible as any,
        votingType: votingType as any,
        anonymousVoting,
      }
    }, {
      onSuccess: () => {
        toast.success('Voting event created successfully!');
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setResultsVisible('RESULTS_HIDDEN_DURING_VOTING');
        setVotingType('MULTIPLE');
        setAnonymousVoting(false);
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create voting event.');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Voting Event</DialogTitle>
          <DialogDescription>
            Create a new election or poll for your community members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Community Representative Election" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this vote is about..." required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="bg-white border-slate-200 text-[#0F172A] focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="bg-white border-slate-200 text-[#0F172A] focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voting Type</label>
              <Select value={votingType} onValueChange={setVotingType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE">Multiple Choice</SelectItem>
                  <SelectItem value="RATING">Rating Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Results Visibility</label>
              <Select value={resultsVisible} onValueChange={setResultsVisible}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESULTS_HIDDEN_DURING_VOTING">Hidden During</SelectItem>
                  <SelectItem value="RESULTS_VISIBLE_DURING_VOTING">Visible During</SelectItem>
                  <SelectItem value="RESULTS_VISIBLE_AFTER_VOTING">Visible After</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Anonymous Voting
            </label>
            <Switch
              checked={anonymousVoting}
              onCheckedChange={setAnonymousVoting}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
