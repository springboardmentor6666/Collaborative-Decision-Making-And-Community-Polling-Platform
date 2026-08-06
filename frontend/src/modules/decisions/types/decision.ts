import { UserResponse, CommunityResponse } from "@/types";

export type DecisionStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type DecisionVisibility = "PUBLIC" | "PRIVATE";
export type VoteType = "SINGLE" | "MULTIPLE" | "RATING";

export interface OptionResponse {
  optionId: number;
  decisionId: number;
  title: string;
  description?: string;
  totalScore: number;
  voteCount: number;
  createdAt: string;
}

export interface AttachmentResponse {
  attachmentId: number;
  decisionId: number;
  commentId?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: UserResponse;
  uploadedAt: string;
}

export interface DecisionResponse {
  decisionId: number;
  createdBy: UserResponse;
  community?: CommunityResponse;
  title: string;
  description?: string;
  voteType: VoteType;
  visibility: DecisionVisibility;
  status: DecisionStatus;
  deadline?: string;
  allowAnonymousVote: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  totalVotes: number;
  options: OptionResponse[];
  attachments: AttachmentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OptionRequest {
  title: string;
  description?: string;
}

export interface DecisionRequest {
  title: string;
  description?: string;
  communityId?: number;
  voteType: VoteType;
  visibility: DecisionVisibility;
  deadline?: string;
  allowAnonymousVote: boolean;
  options: OptionRequest[];
}
