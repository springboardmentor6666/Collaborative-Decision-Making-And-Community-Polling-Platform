import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserResponse } from '@/types';
import { useUpdateUserStatus } from '../hooks/useAdmin';
import { toast } from 'sonner';
import { Loader2, UserX, UserMinus, ShieldCheck } from 'lucide-react';

export type UserActionType = 'SUSPEND' | 'DEACTIVATE' | 'REACTIVATE';

interface ReportActionModalProps {
  user: UserResponse | null;
  actionType: UserActionType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReportActionModal({ user, actionType, isOpen, onClose, onSuccess }: ReportActionModalProps) {
  const [reason, setReason] = useState('');
  const updateUserStatusMutation = useUpdateUserStatus();

  if (!user || !actionType) return null;

  const isSuspend = actionType === 'SUSPEND';
  const isDeactivate = actionType === 'DEACTIVATE';
  const isReactivate = actionType === 'REACTIVATE';

  const getTitle = () => {
    if (isSuspend) return `Suspend User Account: @${user.username}`;
    if (isDeactivate) return `Deactivate User Account: @${user.username}`;
    return `Reactivate User Account: @${user.username}`;
  };

  const getDescription = () => {
    if (isSuspend) {
      return `Suspending this account will prevent the user from creating decisions, voting, or posting comments until reactivation. The user will be notified of the reason.`;
    }
    if (isDeactivate) {
      return `Deactivating this account will disable the user's access for serious or repeated policy violations. The user will be notified immediately.`;
    }
    return `Reactivating this account will restore full access to DecisionHub.`;
  };

  const getTargetStatus = (): 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' => {
    if (isSuspend) return 'SUSPENDED';
    if (isDeactivate) return 'INACTIVE';
    return 'ACTIVE';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserStatusMutation.mutateAsync({
        userId: user.userId,
        status: getTargetStatus(),
        reason: reason.trim() || undefined,
      });

      const actionVerb = isSuspend ? 'suspended' : isDeactivate ? 'deactivated' : 'reactivated';
      toast.success(`User @${user.username} has been ${actionVerb}. Notification sent.`);
      setReason('');
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      toast.error('Failed to update user account status.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {isSuspend && <UserMinus className="w-5 h-5 text-amber-500" />}
            {isDeactivate && <UserX className="w-5 h-5 text-red-500" />}
            {isReactivate && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
            <DialogTitle className="text-xl">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!isReactivate && (
            <div className="space-y-2">
              <Label htmlFor="admin-action-reason">
                {isSuspend ? 'Suspension Reason' : 'Deactivation Reason'}
              </Label>
              <Textarea
                id="admin-action-reason"
                placeholder="e.g. Multiple reports for spamming scam links across decision boards..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                className="bg-slate-50"
              />
            </div>
          )}

          <div className="bg-slate-50 border rounded-lg p-3 text-xs space-y-1 text-slate-600">
            <div className="font-semibold text-slate-800">Target User Details:</div>
            <div><strong>Name:</strong> {user.fullName || user.username}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Current Status:</strong> <span className="font-mono uppercase">{user.accountStatus}</span></div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isDeactivate ? 'destructive' : isSuspend ? 'default' : 'secondary'}
              className={isSuspend ? 'bg-amber-600 hover:bg-amber-700 text-white' : undefined}
              disabled={updateUserStatusMutation.isPending}
            >
              {updateUserStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSuspend ? 'Suspend User' : isDeactivate ? 'Deactivate User' : 'Reactivate User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
