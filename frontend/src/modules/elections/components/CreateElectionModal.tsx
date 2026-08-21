import React, { useState } from 'react';
import { useCreateElection } from '../hooks/useElections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils';
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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [resultsVisible, setResultsVisible] = useState<string>('RESULTS_HIDDEN_DURING_VOTING');
  const [votingType, setVotingType] = useState<string>('MULTIPLE');
  const [anonymousVoting, setAnonymousVoting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      toast.error('Please fill out all fields including dates.');
      return;
    }

    createMutation.mutate({
      communityId,
      data: {
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        resultsVisible: resultsVisible as any,
        votingType: votingType as any,
        anonymousVoting,
      }
    }, {
      onSuccess: () => {
        toast.success('Voting event created successfully!');
        setTitle('');
        setDescription('');
        setStartDate(undefined);
        setEndDate(undefined);
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
      <DialogContent className="sm:max-w-[425px]">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
