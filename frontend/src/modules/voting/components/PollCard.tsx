import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DecisionResponse } from '@/modules/decisions/types/decision';
import { useAuth } from '@/context/AuthContext';
import { useVoteMutations } from '../hooks/useVoteMutations';
import { useHasVoted } from '../hooks/useHasVoted';
import { useVoteResults } from '../hooks/useVoteResults';

interface PollCardProps {
  decision: DecisionResponse;
}

export function PollCard({ decision }: PollCardProps) {
  const [currentSelections, setCurrentSelections] = useState<number[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { hasVoted, savedVote, setVoteData } = useHasVoted(decision.decisionId);
  const { castVote, castAnonymousVote, changeVote } = useVoteMutations();
  const { data: results, isLoading: isLoadingResults } = useVoteResults(decision.decisionId);
  
  const isMultiple = decision.voteType === 'MULTIPLE';
  const isRating = decision.voteType === 'RATING';
  const [ratings, setRatings] = useState<Record<number, number>>({});

  // Initialize current selection with saved option if user has voted
  useEffect(() => {
    if (savedVote && savedVote.selections.length > 0) {
      setCurrentSelections(savedVote.selections.map(v => v.optionId));
      
      if (isRating) {
        const newRatings: Record<number, number> = {};
        savedVote.selections.forEach(v => {
          if (v.rating) newRatings[v.optionId] = v.rating;
        });
        setRatings(newRatings);
      }
    }
  }, [savedVote, isRating]);

  const toggleSelection = (optionId: number) => {
    if (isMultiple || isRating) {
      setCurrentSelections(prev => {
        if (prev.includes(optionId)) {
          const next = prev.filter(id => id !== optionId);
          if (isRating) {
             const { [optionId]: _, ...rest } = ratings;
             setRatings(rest);
          }
          return next;
        } else {
          if (isRating) {
             setRatings(r => ({ ...r, [optionId]: 10 }));
          }
          return [...prev, optionId];
        }
      });
    } else {
      setCurrentSelections([optionId]);
    }
  };

  const isClosed = decision.status === 'CLOSED' || (decision.deadline && new Date(decision.deadline) < new Date());

  const handleVoteSubmit = async () => {
    if (currentSelections.length === 0) return;

    try {
      const selections = currentSelections.map(optionId => ({
        optionId,
        rating: isRating ? ratings[optionId] : undefined
      }));

      const request = { decisionId: decision.decisionId, selections };

      if (hasVoted && savedVote) {
        // Change existing vote
        const response = await changeVote.mutateAsync({ voteId: savedVote.voteId, request });
        setVoteData({ voteId: response.voteId, selections: response.selections });
      } else {
        // Cast new vote
        const mutation = isAnonymous ? castAnonymousVote : castVote;
        const response = await mutation.mutateAsync(request);
        setVoteData({ voteId: response.voteId, selections: response.selections });
      }
    } catch (e) {
      // Errors handled by mutation toasts
    }
  };

  const isPending = castVote.isPending || castAnonymousVote.isPending || changeVote.isPending;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-[#0F172A] mb-6">
        {isClosed ? 'Voting is Closed' : hasVoted ? 'Update Your Vote' : 'Cast Your Vote'}
      </h2>

      {isClosed && (
        <div className="mb-6 p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#64748B] shrink-0" />
          <div>
            <p className="text-sm text-[#0F172A] font-semibold">Poll Closed</p>
            <p className="text-sm text-[#64748B]">This decision is no longer accepting new votes.</p>
          </div>
        </div>
      )}

      {(hasVoted || isClosed) ? (
        <>
          {!isClosed && hasVoted && (
            <div className="mt-2">
              <p className="text-sm text-[#64748B] mb-4">You have already voted. You can update your choice below.</p>
                <div className="space-y-3">
                  {isLoadingResults ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : decision.options.map(option => {
                    const votes = results?.optionVoteCounts[option.optionId] || 0;
                    const percentage = results?.totalVotesCount ? (votes / results.totalVotesCount) * 100 : 0;
                    const displayPercentage = percentage % 1 === 0 ? percentage : percentage.toFixed(1);

                    return (
                      <label 
                        key={option.optionId}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                          !isClosed ? 'cursor-pointer' : ''
                        } ${
                          currentSelections.includes(option.optionId) 
                            ? 'bg-blue-50 border-[#2563EB]' 
                            : 'bg-slate-50 border-[#E2E8F0] hover:border-slate-300'
                        }`}
                      >
                        {!isClosed && (
                          <input 
                            type={isMultiple || isRating ? "checkbox" : "radio"} 
                            name={(isMultiple || isRating) ? `poll-option-${option.optionId}` : "poll-option-edit"} 
                            className={`w-4 h-4 shrink-0 text-blue-600 border-[#CBD5E1] bg-white focus:ring-blue-600 focus:ring-offset-white ${isMultiple || isRating ? 'rounded' : 'rounded-full'}`} 
                            checked={currentSelections.includes(option.optionId)}
                            onChange={() => toggleSelection(option.optionId)}
                          />
                        )}
                        <div className="w-24 sm:w-32 shrink-0 font-medium text-[#0F172A] truncate">
                          {option.title}
                        </div>
                        {isRating && currentSelections.includes(option.optionId) && !isClosed && (
                          <select 
                            value={ratings[option.optionId] || 10} 
                            onChange={(e) => setRatings(r => ({ ...r, [option.optionId]: Number(e.target.value) }))}
                            className="bg-white text-[#0F172A] border border-[#CBD5E1] rounded px-2 py-1 text-sm outline-none focus:border-[#2563EB]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i+1} value={i+1}>{i+1} / 10</option>
                            ))}
                          </select>
                        )}
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden border border-[#E2E8F0]">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 shrink-0 text-right text-sm text-[#64748B] hidden sm:block">
                          {isRating ? `${votes} score` : `${votes} ${votes === 1 ? 'vote' : 'votes'}`}
                        </div>
                        {!isRating && (
                          <div className="w-12 shrink-0 text-right text-sm font-bold text-[#0F172A]">
                            {displayPercentage}%
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
                
                {!isClosed && (
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={handleVoteSubmit} 
                      disabled={isPending || currentSelections.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Update Vote
                    </Button>
                  </div>
                )}
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
                    currentSelections.includes(option.optionId) 
                      ? 'bg-blue-50 border-[#2563EB]' 
                      : 'bg-slate-50 border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <input 
                    type={isMultiple || isRating ? "checkbox" : "radio"} 
                    name={(isMultiple || isRating) ? `poll-option-${option.optionId}` : "poll-option"} 
                    className={`w-4 h-4 shrink-0 text-blue-600 border-[#CBD5E1] bg-white focus:ring-blue-600 focus:ring-offset-white ${isMultiple || isRating ? 'rounded' : 'rounded-full'}`} 
                    checked={currentSelections.includes(option.optionId)}
                    onChange={() => toggleSelection(option.optionId)}
                  />
                  <span className="text-[#0F172A] font-medium">{option.title}</span>
                  {isRating && currentSelections.includes(option.optionId) && (
                    <select 
                      value={ratings[option.optionId] || 10} 
                      onChange={(e) => setRatings(r => ({ ...r, [option.optionId]: Number(e.target.value) }))}
                      className="ml-auto bg-white text-[#0F172A] border border-[#CBD5E1] rounded px-2 py-1 text-sm outline-none focus:border-[#2563EB]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} / 10</option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {decision.allowAnonymousVote ? (
                <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-lg border border-[#E2E8F0]">
                  <Switch 
                    id="anonymous-mode" 
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    className="data-[state=checked]:bg-[#2563EB]"
                  />
                  <Label htmlFor="anonymous-mode" className="flex items-center gap-2 cursor-pointer text-[#0F172A]">
                    <UserX className="w-4 h-4 text-[#64748B]" />
                    Vote Anonymously
                  </Label>
                </div>
              ) : (
                <div className="text-sm text-[#64748B]">
                  Your vote will be public.
                </div>
              )}

              <Button 
                onClick={handleVoteSubmit} 
                disabled={isPending || currentSelections.length === 0}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Vote
              </Button>
            </div>
          </>
        )}
    </div>
  );
}
