export interface VotingEvent {
  eventId: number;
  communityId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "UPCOMING" | "ACTIVE" | "CLOSED" | "CANCELLED";
  resultsVisible: "RESULTS_HIDDEN_DURING_VOTING" | "RESULTS_VISIBLE_DURING_VOTING" | "RESULTS_VISIBLE_AFTER_VOTING";
  resultsPublished: boolean;
}

export interface ElectionResultsResponse {
  eventId: number;
  title: string;
  totalEligibleMembers: number;
  totalVotes: number;
  participationRate: number;
  categories: CategoryResultResponse[];
}

export interface CategoryResultResponse {
  categoryId: number;
  categoryName: string;
  totalVotes: number;
  winnerStatus: string;
  winners: NomineeResultResponse[];
  nominees: NomineeResultResponse[];
}

export interface NomineeResultResponse {
  nomineeId: number;
  name: string;
  votes: number;
  percentage: number;
}

export interface VotingCategory {
  categoryId: number;
  eventId: number;
  name: string;
  description: string;
  maxSelections: number;
}

export interface Nominee {
  nomineeId: number;
  categoryId: number;
  name: string;
  description: string;
  imageUrl?: string;
  nominationStatus: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
}

export interface ElectionVoteRequest {
  nomineeId: number;
}

export interface VotingEventRequest {
  title: string;
  description: string;
  startDate?: string; // ISO String
  endDate?: string;   // ISO String
  votingType: "SINGLE" | "MULTIPLE" | "RATING";
  anonymousVoting: boolean;
  resultsVisible: "RESULTS_HIDDEN_DURING_VOTING" | "RESULTS_VISIBLE_DURING_VOTING" | "RESULTS_VISIBLE_AFTER_VOTING";
}

export interface VotingCategoryRequest {
  name: string;
  description: string;
  maxSelections: number;
}

export interface NomineeRequest {
  name: string;
  description: string;
  imageUrl?: string;
  externalUrl?: string;
}
