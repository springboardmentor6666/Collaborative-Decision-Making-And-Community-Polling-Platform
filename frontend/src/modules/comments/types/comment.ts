import { UserResponse } from '../../../types';

export interface CommentResponse {
  commentId: number;
  decisionId: number;
  user: UserResponse;
  parentCommentId: number | null;
  message: string;
  edited: boolean;
  replies: CommentResponse[];
  createdAt: string;
}

export interface CommentRequest {
  decisionId: number;
  parentCommentId?: number | null;
  message: string;
}
