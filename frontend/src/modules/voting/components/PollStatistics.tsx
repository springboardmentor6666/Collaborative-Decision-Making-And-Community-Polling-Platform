import React from 'react';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { DecisionResponse } from '@/modules/decisions/types/decision';

interface PollStatisticsProps {
  decision: DecisionResponse;
  totalVotesCount: number;
}

export function PollStatistics({ decision, totalVotesCount }: PollStatisticsProps) {
  // If no community is attached, assume everyone can vote (no participation limit)
  const eligibleVoters = decision.community ? decision.community.memberCount : null;
  const participationRate = eligibleVoters && eligibleVoters > 0 
    ? Math.round((totalVotesCount / eligibleVoters) * 100) 
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Poll Statistics</h3>
      
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-slate-400">Total Votes</p>
          <p className="text-xl font-bold text-white">{totalVotesCount}</p>
        </div>
      </div>

      {participationRate !== null && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Participation Rate</p>
            <p className="text-xl font-bold text-white">{participationRate}%</p>
          </div>
        </div>
      )}

      {decision.community && (
        <div className="flex flex-col pt-3 border-t border-slate-800">
          <span className="text-sm text-slate-400">Eligible Voters</span>
          <span className="text-md font-medium text-slate-300">{eligibleVoters} members</span>
        </div>
      )}
    </div>
  );
}
