import React, { useState } from "react";
import { HikeIcon } from "@/components/icons/HikeIcon";
import { useHikeMutation } from "../hooks/useHikeMutation";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HikeButtonProps {
  decisionId: number;
  isHiked?: boolean;
  hikeCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export const HikeButton: React.FC<HikeButtonProps> = ({
  decisionId,
  isHiked: initialHiked = false,
  hikeCount: initialCount = 0,
  size = "md",
  showCount = true,
  className = "",
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hikeMutation = useHikeMutation(decisionId);

  // Local state for immediate snappy UI feedback + twitter bounce trigger
  const [hiked, setHiked] = useState(initialHiked);
  const [count, setCount] = useState(initialCount);
  const [isBouncing, setIsBouncing] = useState(false);

  // Keep in sync with parent props when they update
  React.useEffect(() => {
    setHiked(initialHiked);
  }, [initialHiked]);

  React.useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleToggleHike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please log in to hike this decision", {
        action: {
          label: "Log in",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    const nextHiked = !hiked;
    const nextCount = nextHiked ? count + 1 : Math.max(0, count - 1);

    setHiked(nextHiked);
    setCount(nextCount);

    if (nextHiked) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 600);
    }

    hikeMutation.mutate(undefined, {
      onSuccess: (data) => {
        setHiked(data.isHiked);
        setCount(data.hikeCount);
      },
      onError: () => {
        // Rollback on failure
        setHiked(!nextHiked);
        setCount(count);
      },
    });
  };

  // Size styling variants
  const sizeClasses = {
    sm: "h-7 px-2 text-xs gap-1.5 rounded-lg",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5 font-medium",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleToggleHike}
      disabled={hikeMutation.isPending}
      aria-label={hiked ? "Unhike decision" : "Hike decision"}
      className={`relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 select-none group cursor-pointer ${
        sizeClasses[size]
      } ${
        hiked
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10"
          : "bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 hover:border-border"
      } ${className}`}
    >
      {/* Twitter-like ripple particle effect on click */}
      {isBouncing && (
        <span
          className="absolute inset-0 rounded-xl pointer-events-none animate-ping bg-emerald-500/20 duration-500"
          style={{ animationIterationCount: 1 }}
        />
      )}

      {/* Icon with spring bounce animation */}
      <span
        className={`relative inline-flex items-center justify-center transition-transform ${
          isBouncing ? "animate-[bounce_0.5s_ease-in-out]" : "group-hover:-translate-y-0.5"
        }`}
        style={
          isBouncing
            ? {
                animation: "twitterPop 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }
            : undefined
        }
      >
        <HikeIcon
          hiked={hiked}
          className={`${iconSizes[size]} transition-all duration-300 ${
            hiked ? "drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]" : "opacity-80 group-hover:opacity-100"
          }`}
        />
      </span>

      {/* Label and Count */}
      {showCount && (
        <span
          className={`tabular-nums font-semibold tracking-tight transition-colors duration-200 ${
            hiked ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {count > 0 ? count : 0}
        </span>
      )}

      {/* Embedded CSS keyframe for the Twitter-like pop spring animation */}
      <style>{`
        @keyframes twitterPop {
          0% {
            transform: scale(0.85);
          }
          40% {
            transform: scale(1.45);
          }
          70% {
            transform: scale(0.92);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </button>
  );
};

export default HikeButton;
