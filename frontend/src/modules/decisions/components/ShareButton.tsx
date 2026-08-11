import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  decisionId: number;
  title: string;
  className?: string;
}

export function ShareButton({ decisionId, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/decisions/${decisionId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Decision: ${title}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleShare}
      className={`text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors ${className}`}
      title="Share Decision"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
      <span className="ml-2 hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
    </Button>
  );
}
