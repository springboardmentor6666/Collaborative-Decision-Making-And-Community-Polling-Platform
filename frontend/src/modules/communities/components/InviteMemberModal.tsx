import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommunityMutations } from "../hooks/useCommunityMutations";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberModalProps {
  communityId: number;
}

export function InviteMemberModal({ communityId }: InviteMemberModalProps) {
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { inviteUser } = useCommunityMutations();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) return;
    
    inviteUser.mutate(
      { communityId, username: cleanUsername },
      {
        onSuccess: (data) => {
          toast.success(`@${data.user?.username || cleanUsername} invited successfully!`);
          setIsOpen(false);
          setUsername("");
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || "Failed to invite user. Please verify the username.";
          toast.error(errMsg);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Invite a Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">@</span>
              <Input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username (e.g. johndoe)"
                className="pl-7 bg-background border-border text-foreground focus-visible:ring-blue-500"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the username or email of the member you wish to invite.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-border text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUser.isPending || !username.trim()} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              {inviteUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
