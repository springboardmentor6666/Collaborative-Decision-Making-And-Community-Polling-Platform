import React from "react";
import { Link } from "react-router-dom";
import { Loader2, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityElections } from "../hooks/useElections";
import { VotingEvent } from "../types";

interface ElectionsListProps {
  communityId: number;
}

export function ElectionsList({ communityId }: ElectionsListProps) {
  const { data: elections, isLoading, isError } = useCommunityElections(communityId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load elections. Please try again.
      </div>
    );
  }

  if (!elections || elections.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No Active Voting Arenas</h3>
        <p className="text-slate-500">There are currently no voting events in this community.</p>
      </div>
    );
  }

  const getStatusBadge = (status: VotingEvent["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active Now</Badge>;
      case "UPCOMING":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Upcoming</Badge>;
      case "CLOSED":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {elections.map((election) => (
        <Card key={election.eventId} className="overflow-hidden transition-all hover:shadow-md border-[#E2E8F0]">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900">{election.title}</h3>
                {getStatusBadge(election.status)}
              </div>
              <p className="text-slate-600 mb-4 line-clamp-2">{election.description}</p>
              
              <div className="flex items-center text-sm text-slate-500 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="p-6 md:border-l border-[#E2E8F0] bg-slate-50 flex items-center justify-center md:min-w-[200px]">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link to={`/communities/${communityId}/elections/${election.eventId}`}>
                  {election.status === "CLOSED" ? "View Results" : "Enter Voting Arena"}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
