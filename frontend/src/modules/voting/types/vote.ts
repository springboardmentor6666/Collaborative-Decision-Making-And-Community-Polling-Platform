import { UserResponse } from "@/types";
import { OptionResponse } from "@/modules/decisions/types/decision";

export interface SelectionDto {
  optionId: number;
  rating?: number;
}

export interface VoteRequest {
  decisionId: number;
  selections: SelectionDto[];
}

export interface VoteResponse {
  voteId: number;
  decisionId: number;
  voter?: UserResponse;
  selections: SelectionDto[];
  createdAt: string;
}

export interface VoteResultResponse {
  decisionId: number;
  totalVotesCount: number;
  optionVoteCounts: Record<number, number>;
  optionPercentages: Record<number, number>;
  winningOption?: OptionResponse;
}
