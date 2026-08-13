import React from "react";
import { Button } from "@/components/ui/button";
import { useCommunityMutations } from "../hooks/useCommunityMutations";
import { Loader2 } from "lucide-react";

import { CommunityMemberResponse, CommunityVisibility } from "../types/community";

interface JoinButtonProps {
  communityId: number;
  membership: CommunityMemberResponse | null;
  communityVisibility?: CommunityVisibility;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function JoinButton({ communityId, membership, communityVisibility, variant = "outline", className }: JoinButtonProps) {
  const { joinCommunity, leaveCommunity } = useCommunityMutations();

  const isPendingAPI = joinCommunity.isPending || leaveCommunity.isPending;
  const isMember = membership?.status === "ACTIVE";
  const isPendingApproval = membership?.status === "PENDING";
  const isRejected = membership?.status === "REJECTED";

  const handleToggleJoin = () => {
    if (isMember) {
      leaveCommunity.mutate(communityId);
    } else if (!isPendingApproval && !isRejected) {
      joinCommunity.mutate(communityId);
    }
  };

  let buttonText = "Join";
  if (isMember) buttonText = "Leave";
  else if (isPendingApproval) buttonText = "Pending Approval";
  else if (isRejected) buttonText = "Request Rejected";
  else if (communityVisibility === "PRIVATE") buttonText = "Request to Join";

  let computedClassName = className || "";
  if (isMember || buttonText === "Join") {
    computedClassName += " bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium";
  }

  return (
    <Button 
      variant={isMember || buttonText === "Join" ? "outline" : variant}
      onClick={handleToggleJoin}
      disabled={isPendingAPI || isPendingApproval || isRejected}
      className={computedClassName}
    >
      {isPendingAPI && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {buttonText}
    </Button>
  );
}
