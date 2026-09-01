import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  UserX, 
  Vote, 
  BarChart2, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trophy, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DecisionResponse } from '@/modules/decisions/types/decision';
import { useVoteMutations } from '../hooks/useVoteMutations';
import { useHasVoted } from '../hooks/useHasVoted';
import { useVoteResults } from '../hooks/useVoteResults';

interface PollCardProps {
  decision: DecisionResponse;
}

export function PollCard({ decision }: PollCardProps) {
  const [currentSelections, setCurrentSelections] = useState<number[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isEditingVote, setIsEditingVote] = useState(false);
  const [showLiveResults, setShowLiveResults] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const { hasVoted, savedVote, setVoteData } = useHasVoted(decision.decisionId);
  const { castVote, castAnonymousVote, changeVote } = useVoteMutations();
  const { data: results, isLoading: isLoadingResults } = useVoteResults(decision.decisionId);

  const isMultiple = decision.voteType === 'MULTIPLE';
  const isRating = decision.voteType === 'RATING';
  const isClosed = decision.status === 'CLOSED' || decision.status === 'ARCHIVED' || (decision.deadline && new Date(decision.deadline) < new Date());

  // Initialize selections with saved user vote
  useEffect(() => {
    if (savedVote && savedVote.selections && savedVote.selections.length > 0) {
      const selectedOptionIds = savedVote.selections.map(v => v.optionId);
      setCurrentSelections(selectedOptionIds);

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

  const handleVoteSubmit = async () => {
    if (currentSelections.length === 0) return;

    try {
      const selections = currentSelections.map(optionId => ({
        optionId,
        rating: isRating ? (ratings[optionId] || 10) : undefined
      }));

      const request = { decisionId: decision.decisionId, selections };

      if (hasVoted && savedVote) {
        const response = await changeVote.mutateAsync({ voteId: savedVote.voteId, request });
        setVoteData({ voteId: response.voteId, selections: response.selections });
        setIsEditingVote(false);
      } else {
        const mutation = isAnonymous ? castAnonymousVote : castVote;
        const response = await mutation.mutateAsync(request);
        setVoteData({ voteId: response.voteId, selections: response.selections });
      }
    } catch {
      // Handled by mutation toasts
    }
  };

  // Compute total votes
  const totalVotesCount = results?.totalVotesCount ?? decision.totalVotes ?? 0;

  // Safe helper to get vote count for an option
  const getOptionVotes = (optionId: number): number => {
    if (results?.optionVoteCounts) {
      if (results.optionVoteCounts[optionId] !== undefined) return Number(results.optionVoteCounts[optionId]);
      if (results.optionVoteCounts[String(optionId) as any] !== undefined) return Number(results.optionVoteCounts[String(optionId) as any]);
    }
    const option = decision.options?.find(o => o.optionId === optionId);
    return option?.voteCount ?? 0;
  };

  // Safe helper to get percentage for an option
  const getOptionPercentage = (optionId: number): number => {
    if (totalVotesCount > 0) {
      const votes = getOptionVotes(optionId);
      return Math.round((votes / totalVotesCount) * 1000) / 10;
    }
    if (results?.optionPercentages) {
      if (results.optionPercentages[optionId] !== undefined) return Number(results.optionPercentages[optionId]);
      if (results.optionPercentages[String(optionId) as any] !== undefined) return Number(results.optionPercentages[String(optionId) as any]);
    }
    return 0;
  };

  // Determine top/winning option
  const maxOptionVotes = Math.max(0, ...(decision.options?.map(o => getOptionVotes(o.optionId)) || [0]));

  const isPending = castVote.isPending || castAnonymousVote.isPending || changeVote.isPending;
  const shouldShowResultsView = (hasVoted && !isEditingVote) || isClosed || showLiveResults;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F172A]">
              {isClosed 
                ? 'Poll Results' 
                : hasVoted && !isEditingVote 
                  ? 'Your Vote & Live Results' 
                  : isEditingVote 
                    ? 'Update Your Vote' 
                    : 'Cast Your Vote'}
            </h2>
            <Badge variant="outline" className="text-xs font-semibold text-slate-600 bg-slate-50 border-slate-200">
              {totalVotesCount} {totalVotesCount === 1 ? 'total vote' : 'total votes'}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            {decision.voteType === 'SINGLE' && 'Single choice poll • Select 1 option'}
            {decision.voteType === 'MULTIPLE' && 'Multiple choice poll • Select all that apply'}
            {decision.voteType === 'RATING' && 'Rating poll • Rate each option from 1 to 10'}
          </p>
        </div>

        {/* Action Toggle (e.g. view results before voting or edit vote) */}
        {!isClosed && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasVoted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingVote(prev => !prev)}
                className="text-xs font-semibold h-8 gap-1.5 border-slate-200 hover:bg-slate-50 text-[#0F172A]"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                {isEditingVote ? 'Cancel Edit' : 'Change Vote'}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLiveResults(prev => !prev)}
                className="text-xs font-semibold h-8 gap-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                {showLiveResults ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Results</span>
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Standings</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Closed Banner */}
      {isClosed && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
          <div>
            <p className="text-sm text-[#0F172A] font-semibold">Voting is Closed</p>
            <p className="text-xs text-[#64748B]">Final results are displayed below.</p>
          </div>
        </div>
      )}

      {/* 1. RESULTS VIEW (when user voted, or poll closed, or viewing standings) */}
      {shouldShowResultsView && !isEditingVote ? (
        <div className="space-y-4">
          {isLoadingResults ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            decision.options?.map((option) => {
              const votes = getOptionVotes(option.optionId);
              const percentage = getOptionPercentage(option.optionId);
              const isSelectedByUser = currentSelections.includes(option.optionId);
              const isLeading = maxOptionVotes > 0 && votes === maxOptionVotes;

              return (
                <div
                  key={option.optionId}
                  className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                    isSelectedByUser
                      ? 'bg-blue-50/70 border-[#2563EB] shadow-xs'
                      : isLeading && totalVotesCount > 0
                        ? 'bg-amber-50/40 border-amber-200/80'
                        : 'bg-slate-50/60 border-[#E2E8F0]'
                  }`}
                >
                  {/* Progress Bar Fill */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out pointer-events-none ${
                      isSelectedByUser
                        ? 'bg-blue-500/15'
                        : isLeading && totalVotesCount > 0
                          ? 'bg-amber-500/15'
                          : 'bg-slate-300/20'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-sm sm:text-base text-[#0F172A] truncate">
                          {option.title}
                        </span>

                        {isSelectedByUser && (
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            Your Vote
                          </Badge>
                        )}

                        {isLeading && totalVotesCount > 0 && (
                          <Badge variant="outline" className="bg-amber-100/80 text-amber-800 border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Trophy className="w-3 h-3 text-amber-600" />
                            {isClosed ? 'Winner' : 'Leading'}
                          </Badge>
                        )}
                      </div>

                      {/* Vote Count and Percentage */}
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-xs sm:text-sm font-medium text-slate-500">
                          {isRating ? `${votes} score` : `${votes} ${votes === 1 ? 'vote' : 'votes'}`}
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#0F172A] min-w-[48px]">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Option description (if present) */}
                    {option.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Quick CTA to Vote if viewing standings before voting */}
          {!hasVoted && !isClosed && (
            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setShowLiveResults(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9"
              >
                <Vote className="w-3.5 h-3.5 mr-1.5" />
                Proceed to Vote
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* 2. VOTING SELECTION VIEW (when casting or editing vote) */
        <div className="space-y-4">
          <div className="space-y-3">
            {decision.options?.map((option) => {
              const isSelected = currentSelections.includes(option.optionId);

              return (
                <label
                  key={option.optionId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#2563EB] shadow-xs'
                      : 'bg-slate-50 border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <input
                      type={isMultiple || isRating ? 'checkbox' : 'radio'}
                      name={isMultiple || isRating ? `poll-opt-${option.optionId}` : 'poll-option'}
                      className={`w-4 h-4 mt-0.5 sm:mt-0 shrink-0 text-blue-600 border-slate-300 focus:ring-blue-600 ${
                        isMultiple || isRating ? 'rounded' : 'rounded-full'
                      }`}
                      checked={isSelected}
                      onChange={() => toggleSelection(option.optionId)}
                    />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-[#0F172A]">
                        {option.title}
                      </p>
                      {option.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating Selector */}
                  {isRating && isSelected && (
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs font-medium text-slate-500">Score:</span>
                      <select
                        value={ratings[option.optionId] || 10}
                        onChange={(e) => setRatings(r => ({ ...r, [option.optionId]: Number(e.target.value) }))}
                        className="bg-white text-[#0F172A] font-semibold border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-600 shadow-xs"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} / 10
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {/* Voting Action Bar */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {decision.allowAnonymousVote ? (
              <div className="flex items-center space-x-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-[#E2E8F0]">
                <Switch
                  id="anonymous-vote-toggle"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  className="data-[state=checked]:bg-[#2563EB]"
                />
                <Label htmlFor="anonymous-vote-toggle" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0F172A]">
                  <UserX className="w-3.5 h-3.5 text-slate-500" />
                  Vote Anonymously
                </Label>
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                Your vote will be verified and attributed to your profile.
              </span>
            )}

            <div className="flex items-center gap-2 justify-end">
              {isEditingVote && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingVote(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
              )}

              <Button
                onClick={handleVoteSubmit}
                disabled={isPending || currentSelections.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-7 h-10 shadow-md shadow-blue-500/20"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {hasVoted ? 'Save Changes' : 'Submit Vote'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

