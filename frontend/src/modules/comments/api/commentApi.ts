import api from '../../../api/axios';
import { ApiResponse, PagedResponse } from '../../../types';
import { CommentRequest, CommentResponse } from '../types/comment';

export const commentApi = {
  fetchComments: async (
    decisionId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<CommentResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<CommentResponse>>>(
      `/comments/decision/${decisionId}`,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },

  createComment: async (data: CommentRequest): Promise<CommentResponse> => {
    const response = await api.post<ApiResponse<CommentResponse>>('/comments', data);
    return response.data.data;
  },

  updateComment: async (commentId: number, message: string): Promise<CommentResponse> => {
    const response = await api.put<ApiResponse<CommentResponse>>(
      `/comments/${commentId}`,
      null,
      {
        params: { message },
      }
    );
    return response.data.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/comments/${commentId}`);
  },
};
