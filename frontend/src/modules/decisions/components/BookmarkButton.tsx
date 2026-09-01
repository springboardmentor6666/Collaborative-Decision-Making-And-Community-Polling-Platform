import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useDecisionMutations } from "../hooks/useDecisionMutations";

interface BookmarkButtonProps {
  decisionId: number;
  isSaved?: boolean;
  className?: string;
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  onUnsaved?: () => void;
  onToggle?: (isSaved: boolean) => void;
}

export function BookmarkButton({ 
  decisionId, 
  isSaved = false, 
  className = "",
  variant = "ghost",
  size = "sm",
  showLabel = true,
  onUnsaved,
  onToggle,
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(isSaved);
  const { saveDecision, unsaveDecision } = useDecisionMutations();

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const isPending = saveDecision.isPending || unsaveDecision.isPending;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();

    if (saved) {
      unsaveDecision.mutate(decisionId, {
        onSuccess: () => {
          setSaved(false);
          onUnsaved?.();
          onToggle?.(false);
        },
      });
    } else {
      saveDecision.mutate(decisionId, {
        onSuccess: () => {
          setSaved(true);
          onToggle?.(true);
        },
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleToggle}
      disabled={isPending}
      className={`transition-all duration-200 ${
        saved 
          ? "text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 border-blue-200" 
          : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50"
      } ${className}`}
      title={saved ? "Remove from Saved" : "Save Decision"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <Bookmark className="w-4 h-4 fill-blue-600 text-blue-600" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {showLabel && (
        <span className="ml-2 hidden sm:inline font-medium">
          {saved ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}
