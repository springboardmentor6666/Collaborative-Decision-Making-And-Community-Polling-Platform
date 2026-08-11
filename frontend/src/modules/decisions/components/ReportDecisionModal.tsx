import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportDecision } from '../hooks/useAbuseReport';
import { AbuseReason } from '../api/abuseReportApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ReportDecisionModalProps {
  decisionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDecisionModal({ decisionId, isOpen, onClose }: ReportDecisionModalProps) {
  const [reason, setReason] = useState<AbuseReason>('ABUSE');
  const [description, setDescription] = useState('');
  const reportMutation = useReportDecision();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportMutation.mutateAsync({
        decisionId,
        data: { reason, description }
      });
      toast.success('Report submitted successfully. Our team will review it shortly.');
      onClose();
      setDescription('');
      setReason('ABUSE');
    } catch {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Decision</DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Let us know why you are reporting this decision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={(val) => setReason(val as AbuseReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABUSE">Harassment or Abuse</SelectItem>
                <SelectItem value="RESTRICTED_ADULT">Restricted/Adult Content</SelectItem>
                <SelectItem value="SPAM">Spam or Misleading</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more information to help us investigate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={reportMutation.isPending}>
              {reportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
