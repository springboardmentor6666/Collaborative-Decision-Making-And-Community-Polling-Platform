import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommunityMutations } from "../hooks/useCommunityMutations";
import { Loader2, UserPlus } from "lucide-react";

interface InviteMemberModalProps {
  communityId: number;
}

export function InviteMemberModal({ communityId }: InviteMemberModalProps) {
  const [userId, setUserId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { inviteUser } = useCommunityMutations();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    inviteUser.mutate(
      { communityId, userId: parseInt(userId, 10) },
      {
        onSuccess: () => {
          setIsOpen(false);
          setUserId("");
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">User ID</label>
            <Input 
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID (e.g. 2)"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
            <p className="text-xs text-slate-500">
              Note: In a full production app, this would be a searchable user dropdown.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUser.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {inviteUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
