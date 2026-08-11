import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DecisionResponse } from '@/modules/decisions/types/decision';
import { useAuth } from '@/context/AuthContext';
import { useVoteMutations } from '../hooks/useVoteMutations';
import { useVoteResults } from '../hooks/useVoteResults';
import { PollChart } from './PollChart';
import { PollStatistics } from './PollStatistics';

interface PollCardProps {
  decision: DecisionResponse;
}

export function PollCard({ decision }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Temporary workaround: since backend doesn't return user's vote state, track it locally.
  const [hasVoted, setHasVoted] = useState(false);
  const [localVoteId, setLocalVoteId] = useState<number | null>(null);
  
  const { user } = useAuth();
  const storageKey = `decision_vote_${decision.decisionId}_user_${user?.userId || 'guest'}`;

  const { castVote, castAnonymousVote, changeVote } = useVoteMutations();
  const { data: results, isLoading: isLoadingResults } = useVoteResults(decision.decisionId);

  // Check local storage for previous vote
  useEffect(() => {
    const savedVote = localStorage.getItem(storageKey);
    if (savedVote) {
      try {
        const parsed = JSON.parse(savedVote);
        setHasVoted(true);
        setSelectedOption(parsed.optionId);
        if (parsed.voteId) {
          setLocalVoteId(parsed.voteId);
        }
      } catch (e) {
        // ignore parsing error
      }
    } else {
      setHasVoted(false);
      setSelectedOption(null);
      setLocalVoteId(null);
    }
  }, [decision.decisionId, storageKey]);

  const isClosed = decision.status === 'CLOSED' || (decision.deadline && new Date(decision.deadline) < new Date());

  const handleVoteSubmit = () => {
    if (!selectedOption) return;

    if (hasVoted && localVoteId) {
      changeVote.mutate({
        voteId: localVoteId,
        request: { decisionId: decision.decisionId, optionId: selectedOption }
      }, {
        onSuccess: (data) => {
          localStorage.setItem(storageKey, JSON.stringify({ optionId: selectedOption, voteId: data.voteId }));
        }
      });
    } else {
      const request = { decisionId: decision.decisionId, optionId: selectedOption };
      const mutation = isAnonymous ? castAnonymousVote : castVote;
      
      mutation.mutate(request, {
        onSuccess: (data) => {
          setHasVoted(true);
          setLocalVoteId(data.voteId);
          localStorage.setItem(storageKey, JSON.stringify({ optionId: selectedOption, voteId: data.voteId }));
        }
      });
    }
  };

  const isPending = castVote.isPending || castAnonymousVote.isPending || changeVote.isPending;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Poll Options / Chart */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-white mb-6">
          {isClosed ? 'Final Results' : hasVoted ? 'Live Results' : 'Cast Your Vote'}
        </h2>

        {isClosed && results?.winningOption && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
              <p className="text-sm text-blue-400 font-medium">Winning Option</p>
              <p className="text-lg font-bold text-white">{results.winningOption.title}</p>
            </div>
          </div>
        )}

        {(hasVoted || isClosed) ? (
          <>
            {isLoadingResults ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : results ? (
              <PollChart 
                options={decision.options} 
                voteCounts={results.optionVoteCounts} 
                totalVotes={results.totalVotesCount} 
              />
            ) : (
              <p className="text-slate-400 text-center py-10">Results unavailable.</p>
            )}

            {!isClosed && hasVoted && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-4">You have already voted. You can update your choice below.</p>
                <div className="space-y-3">
                  {decision.options.map(option => (
                    <label 
                      key={option.optionId}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedOption === option.optionId 
                          ? 'bg-blue-600/10 border-blue-500' 
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="poll-option-edit" 
                        className="w-4 h-4 text-blue-600 border-slate-600 bg-slate-900 focus:ring-blue-600 focus:ring-offset-slate-900" 
                        checked={selectedOption === option.optionId}
                        onChange={() => setSelectedOption(option.optionId)}
                      />
                      <span className="text-white font-medium">{option.title}</span>
                    </label>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleVoteSubmit} 
                    disabled={isPending || selectedOption === null}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Vote
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3">
              {decision.options.map(option => (
                <label 
                  key={option.optionId}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedOption === option.optionId 
                      ? 'bg-blue-600/10 border-blue-500' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="poll-option" 
                    className="w-4 h-4 text-blue-600 border-slate-600 bg-slate-900 focus:ring-blue-600 focus:ring-offset-slate-900" 
                    checked={selectedOption === option.optionId}
                    onChange={() => setSelectedOption(option.optionId)}
                  />
                  <span className="text-white font-medium">{option.title}</span>
                </label>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {decision.allowAnonymousVote ? (
                <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                  <Switch 
                    id="anonymous-mode" 
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor="anonymous-mode" className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <UserX className="w-4 h-4" />
                    Vote Anonymously
                  </Label>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Your vote will be public.
                </div>
              )}

              <Button 
                onClick={handleVoteSubmit} 
                disabled={isPending || selectedOption === null}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Vote
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Sidebar Statistics */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        {results ? (
          <PollStatistics decision={decision} totalVotesCount={results.totalVotesCount} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-32 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
