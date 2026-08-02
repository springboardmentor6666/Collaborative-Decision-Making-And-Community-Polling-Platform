package com.decisionhub.service;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CommentRequest;
import com.decisionhub.dto.response.CommentResponse;
import org.springframework.data.domain.Pageable;

public interface CommentService {

    CommentResponse createComment(Long userId, CommentRequest request);

    CommentResponse editComment(Long commentId, Long userId, String newMessage);

    void deleteComment(Long commentId, Long userId);

    PagedResponse<CommentResponse> getCommentsByDecision(Long decisionId, Pageable pageable);
}
