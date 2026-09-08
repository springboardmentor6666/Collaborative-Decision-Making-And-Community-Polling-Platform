import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteAccount } from '../hooks/useProfile';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const DeleteAccountDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const deleteMutation = useDeleteAccount();

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      await deleteMutation.mutateAsync();
      toast.success('Account successfully deleted');
      setOpen(false);
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Delete Account Permanently?
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            This action is irreversible. All of your personal details and active sessions will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-xs text-destructive space-y-1.5">
            <p className="font-semibold">Important Consequences:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90">
              <li>Communities you own may be permanently disbanded.</li>
              <li>Your previous votes will be disconnected from your identity.</li>
              <li>You will immediately lose access to your bookmarked decisions.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmDeleteInput" className="text-xs font-medium">
              Type <strong className="text-destructive font-bold">DELETE</strong> to confirm:
            </Label>
            <Input
              id="confirmDeleteInput"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="text-center font-mono tracking-wider uppercase"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmText('');
              setOpen(false);
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={!isConfirmed || deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
