import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { useDecisionMutations } from "../hooks/useDecisionMutations";

interface BookmarkButtonProps {
  decisionId: number;
  isSaved?: boolean;
  className?: string;
}

export function BookmarkButton({ decisionId, isSaved = false, className }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(isSaved);
  const { saveDecision, unsaveDecision } = useDecisionMutations();

  const isPending = saveDecision.isPending || unsaveDecision.isPending;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();

    if (saved) {
      unsaveDecision.mutate(decisionId, {
        onSuccess: () => setSaved(false),
      });
    } else {
      saveDecision.mutate(decisionId, {
        onSuccess: () => setSaved(true),
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleToggle}
      disabled={isPending}
      className={`text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors ${saved ? "text-blue-500" : ""} ${className}`}
      title={saved ? "Remove Bookmark" : "Save Decision"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
      )}
      <span className="ml-2 hidden sm:inline">{saved ? "Saved" : "Save"}</span>
    </Button>
  );
}
