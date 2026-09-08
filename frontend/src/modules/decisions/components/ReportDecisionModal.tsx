import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportDecision } from '../hooks/useAbuseReport';
import { AbuseReason } from '../api/abuseReportApi';
import { toast } from 'sonner';
import { Loader2, Flag } from 'lucide-react';

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
        data: { reason, description: description.trim() ? description.trim() : undefined }
      });
      toast.success('Report submitted successfully. Our moderation team will review it shortly.');
      onClose();
      setDescription('');
      setReason('ABUSE');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Flag className="w-5 h-5" />
            <DialogTitle className="text-xl">Report Decision</DialogTitle>
          </div>
          <DialogDescription>
            Help us keep the community safe and trustworthy. Let us know why you are reporting this decision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="decision-report-reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={(val) => setReason(val as AbuseReason)}>
              <SelectTrigger id="decision-report-reason" className="bg-slate-50">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABUSE">Abusive or Toxic Content</SelectItem>
                <SelectItem value="HARASSMENT">Harassment or Hate Speech</SelectItem>
                <SelectItem value="IRRELEVANT">Irrelevant / Off-Topic Content</SelectItem>
                <SelectItem value="SPAM">Spam or Commercial Promotion</SelectItem>
                <SelectItem value="SCAM">Scam, Fraud, or Deception</SelectItem>
                <SelectItem value="MISLEADING">Misleading Information</SelectItem>
                <SelectItem value="RESTRICTED_ADULT">Explicit or Inappropriate Content</SelectItem>
                <SelectItem value="OTHER">Other Community Rule Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision-report-desc">Additional Details (Optional)</Label>
            <Textarea
              id="decision-report-desc"
              placeholder="Provide more information to help our moderators investigate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-slate-50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
