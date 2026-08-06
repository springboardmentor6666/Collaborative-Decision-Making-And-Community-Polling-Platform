import { UserResponse } from "@/types";
import { OptionResponse } from "@/modules/decisions/types/decision";

export interface VoteRequest {
  decisionId: number;
  optionId: number;
  rating?: number;
}

export interface VoteResponse {
  voteId: number;
  decisionId: number;
  optionId: number;
  voter?: UserResponse;
  rating?: number;
  createdAt: string;
}

export interface VoteResultResponse {
  decisionId: number;
  totalVotesCount: number;
  optionVoteCounts: Record<number, number>;
  optionPercentages: Record<number, number>;
  winningOption?: OptionResponse;
}
