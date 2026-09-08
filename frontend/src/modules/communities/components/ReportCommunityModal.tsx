import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportCommunity } from '@/modules/decisions/hooks/useAbuseReport';
import { AbuseReason } from '@/modules/decisions/api/abuseReportApi';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ReportCommunityModalProps {
  communityId: number;
  communityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportCommunityModal({ communityId, communityName, isOpen, onClose }: ReportCommunityModalProps) {
  const [reason, setReason] = useState<AbuseReason>('SCAM');
  const [description, setDescription] = useState('');
  const reportMutation = useReportCommunity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportMutation.mutateAsync({
        communityId,
        data: { reason, description: description.trim() ? description.trim() : undefined }
      });
      toast.success(`Report for "${communityName}" submitted. Our safety team will review it.`);
      onClose();
      setDescription('');
      setReason('SCAM');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit community report. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle className="text-xl">Report Community</DialogTitle>
          </div>
          <DialogDescription>
            Help keep DecisionHub safe and trustworthy. Report violations related to <strong>{communityName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="community-report-reason">Violation Category</Label>
            <Select value={reason} onValueChange={(val) => setReason(val as AbuseReason)}>
              <SelectTrigger id="community-report-reason" className="bg-slate-50">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCAM">Scam, Fraud, or Financial Deception</SelectItem>
                <SelectItem value="SPAM">Spam, Phishing, or Commercial Promotion</SelectItem>
                <SelectItem value="MISLEADING">Misleading Information or Impersonation</SelectItem>
                <SelectItem value="HARASSMENT">Harassment, Hate Speech, or Intimidation</SelectItem>
                <SelectItem value="ABUSE">Abusive, Toxic, or Harmful Environment</SelectItem>
                <SelectItem value="RESTRICTED_ADULT">Explicit, Adult, or Illegal Content</SelectItem>
                <SelectItem value="OTHER">Other Terms of Service Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-report-desc">Additional Details (Optional)</Label>
            <Textarea
              id="community-report-desc"
              placeholder="Provide evidence or context for our safety team..."
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
