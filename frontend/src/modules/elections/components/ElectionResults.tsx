import React from "react";
import { Loader2, Trophy, Users, BarChart3, Lock } from "lucide-react";
import { useElectionResults } from "../hooks/useElections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ElectionResults({ eventId }: { eventId: number }) {
  const { data: results, isLoading, error } = useElectionResults(eventId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    const errorMsg = (error as any).response?.data?.message || "Failed to load results.";
    if ((error as any).response?.status === 403) {
      return (
        <Card className="border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-12">
            <Lock className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-orange-800 mb-2">Results are not yet available</h3>
            <p className="text-orange-600 max-w-md">{errorMsg}</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="text-center py-20 text-red-500">
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-sm border-blue-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Eligible Voters</p>
              <h3 className="text-3xl font-bold text-slate-900">{results.totalEligibleMembers}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-sm border-indigo-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Votes Cast</p>
              <h3 className="text-3xl font-bold text-slate-900">{results.totalVotes}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-white shadow-sm border-purple-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Participation</p>
              <h3 className="text-3xl font-bold text-slate-900">{results.participationRate}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {results.categories.map((category) => (
          <Card key={category.categoryId} className="shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{category.categoryName}</h3>
                <p className="text-sm text-slate-500 mt-1">{category.totalVotes} total votes</p>
              </div>
              {category.winnerStatus === "WINNER" && category.winners.length > 0 && (
                <div className="flex items-center gap-3 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Winner: {category.winners[0].name}
                </div>
              )}
              {category.winnerStatus === "TIE" && (
                <div className="flex items-center gap-3 bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
                  <Trophy className="w-5 h-5 text-orange-600" />
                  Tie between {category.winners.length} nominees
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              {category.nominees
                .sort((a, b) => b.votes - a.votes)
                .map((nominee, idx) => {
                  const isWinner = category.winners.some((w) => w.nomineeId === nominee.nomineeId);
                  return (
                    <div key={nominee.nomineeId} className="space-y-2">
                      <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{idx + 1}.</span>
                          <span className="font-semibold text-slate-900">{nominee.name}</span>
                          {isWinner && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white ml-2">Winner</Badge>}
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                          {nominee.votes} votes ({nominee.percentage}%)
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isWinner ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : "bg-gradient-to-r from-blue-500 to-blue-600"
                          }`}
                          style={{ width: `${nominee.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
