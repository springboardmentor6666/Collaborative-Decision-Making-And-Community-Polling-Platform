import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedDecisions } from "../../hooks/useDecisions";
import { DecisionCard } from "../../components/DecisionCard";
import { DecisionFeedSkeleton } from "../../components/DecisionSkeleton";

export default function SavedDecisions() {
  const { data, isLoading } = useSavedDecisions({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Saved Decisions</h1>
            <p className="text-slate-400">Decisions you have bookmarked for later.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DecisionFeedSkeleton />
          </div>
        ) : !data?.content || data.content.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Saved Decisions</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You haven't bookmarked any decisions yet. Click the save icon on any decision to bookmark it.
            </p>
            <Button asChild className="bg-slate-800 hover:bg-slate-700 text-white">
              <Link to="/decisions">Browse Decisions</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((decision: any) => (
              <DecisionCard 
                key={decision.decisionId} 
                decision={decision} 
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
