import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DecisionResponse } from "@/types";
import { TrendingUp, Users } from "lucide-react";

export function TrendingPolls({ decisions }: { decisions: DecisionResponse[] }) {
  const navigate = useNavigate();

  if (!decisions || decisions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Polls
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No trending polls at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending Polls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {decisions.map((decision, index) => {
            const decisionId = (decision as any).decisionId || decision.id;
            return (
            <div 
              key={decisionId} 
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
              onClick={() => navigate(`/decisions/${decisionId}`)}
            >
              <div className="font-bold text-lg text-muted-foreground w-4 text-center">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate" title={decision.title}>
                  {decision.title}
                </p>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {decision.voteCount}
                  </span>
                  <span className="truncate">
                    by {decision.createdBy?.username || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </CardContent>
    </Card>
  );
}
