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
        return { label: "Open", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };
      case "DRAFT":
        return { label: "Draft", color: "bg-amber-50 text-amber-600 border-amber-200" };
      case "CLOSED":
        return { label: "Closed", color: "bg-slate-100 text-slate-600 border-slate-200" };
      case "ARCHIVED":
        return { label: "Archived", color: "bg-red-50 text-red-600 border-red-200" };
      default:
        return { label: status, color: "bg-slate-100 text-slate-600" };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={`font-semibold ${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}
