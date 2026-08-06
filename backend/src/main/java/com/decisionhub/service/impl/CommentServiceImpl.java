package com.decisionhub.service.impl;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CommentRequest;
import com.decisionhub.dto.response.CommentResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.CommentMapper;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Override
    @Transactional
    public CommentResponse createComment(Long userId, CommentRequest request) {
        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", request.getDecisionId()));

        User author = userId != null
                ? userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User", "id", userId))
                : null;

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent Comment", "id", request.getParentCommentId()));
        }

        Comment comment = commentMapper.toEntity(request);
        comment.setDecision(decision);
        comment.setUser(author);
        comment.setParentComment(parentComment);
        comment.setEdited(false);

        Comment savedComment = commentRepository.save(comment);
        return commentMapper.toResponse(savedComment);
    }

    @Override
    @Transactional
    public CommentResponse editComment(Long commentId, Long userId, String newMessage) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment", "id", commentId));

        if (comment.getUser() == null || !comment.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own comments.");
        }

        comment.setMessage(newMessage);
        comment.setEdited(true);
        return commentMapper.toResponse(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment", "id", commentId));

        com.decisionhub.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        boolean isAdmin = user.getRole().getRoleName() == com.decisionhub.common.enums.RoleType.ROLE_ADMIN;

        if ((comment.getUser() != null && !comment.getUser().getUserId().equals(userId)) && !isAdmin) {
            throw new ForbiddenException("Only the author or an admin can delete this comment.");
        }
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommentResponse> getCommentsByDecision(Long decisionId, Pageable pageable) {
        Page<CommentResponse> page = commentRepository
                .findByDecisionDecisionIdAndParentCommentIsNullOrderByCreatedAtDesc(decisionId, pageable)
                .map(comment -> {
                    CommentResponse res = commentMapper.toResponse(comment);
                    List<CommentResponse> replies = commentRepository
                            .findByParentCommentCommentIdOrderByCreatedAtAsc(comment.getCommentId())
                            .stream()
                            .map(commentMapper::toResponse)
                            .toList();
                    res.setReplies(replies);
                    return res;
                });

        return PagedResponse.fromPage(page);
    }
}
