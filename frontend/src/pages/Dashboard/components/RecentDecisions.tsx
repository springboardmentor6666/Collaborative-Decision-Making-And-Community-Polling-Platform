import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DecisionResponse } from "@/types";
import { Target, Users, MessageSquare } from "lucide-react";

export function RecentDecisions({ decisions }: { decisions: DecisionResponse[] }) {
  const navigate = useNavigate();

  if (!decisions || decisions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No decisions yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You haven't participated in or created any decisions recently. Start by creating a new decision or joining a community.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Decisions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {decisions.map((decision) => {
            const decisionId = (decision as any).decisionId || decision.id;
            return (
            <div 
              key={decisionId} 
              className="flex items-start justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/decisions/${decisionId}`)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{decision.title}</h4>
                  <Badge variant={decision.status === 'OPEN' ? 'default' : 'secondary'} className="text-[10px] h-5">
                    {decision.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{decision.description}</p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {decision.voteCount} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {decision.commentCount} comments
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
