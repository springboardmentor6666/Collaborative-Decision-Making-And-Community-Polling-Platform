import React from "react";
import { Badge } from "@/components/ui/badge";
import { DecisionStatus } from "../types/decision";

interface DecisionStatusBadgeProps {
  status: DecisionStatus;
  className?: string;
}

export function DecisionStatusBadge({ status, className }: DecisionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "ACTIVE":
        return { label: "Open", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "DRAFT":
        return { label: "Draft", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "CLOSED":
        return { label: "Closed", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
      case "ARCHIVED":
        return { label: "Archived", color: "bg-red-500/10 text-red-500 border-red-500/20" };
      default:
        return { label: status, color: "bg-slate-800 text-slate-300" };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={`font-semibold ${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}
