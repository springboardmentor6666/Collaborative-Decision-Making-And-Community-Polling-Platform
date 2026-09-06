package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommentRequest;
import com.decisionhub.backend.dto.CommentResponse;
import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.CommentRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired private CommentRepository commentRepository;
    @Autowired private DecisionRepository decisionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    @Transactional
    public CommentResponse addComment(Long decisionId, CommentRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new CustomException("Decision not found", HttpStatus.NOT_FOUND));

        Comment parent = null;
        if (req.getParentCommentId() != null) {
            parent = commentRepository.findById(req.getParentCommentId())
                    .orElseThrow(() -> new CustomException("Parent comment not found", HttpStatus.NOT_FOUND));
        }

        Comment comment = new Comment(user, decision, parent, req.getCommentText());
        Comment saved = commentRepository.save(comment);

        // Send notification to decision creator if not the commenter
        if (decision.getUser() != null && !decision.getUser().getId().equals(user.getId())) {
            notificationService.sendNotification(
                    decision.getUser(),
                    decision,
                    null,
                    "NEW_COMMENT",
                    user.getUsername() + " commented on your decision: '" + decision.getTitle() + "'"
            );
        }

        // Send notification to parent comment author if replying
        if (parent != null && parent.getUser() != null && !parent.getUser().getId().equals(user.getId())) {
            notificationService.sendNotification(
                    parent.getUser(),
                    decision,
                    null,
                    "COMMENT_REPLY",
                    user.getUsername() + " replied to your comment on: '" + decision.getTitle() + "'"
            );
        }

        return toResponse(saved);
    }

    public List<CommentResponse> getCommentsByDecision(Long decisionId) {
        return commentRepository.findByDecisionIdOrderByCreatedAtDesc(decisionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException("Comment not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        boolean isModOrAdmin = "ADMIN".equalsIgnoreCase(user.getRole()) || "ROLE_ADMIN".equalsIgnoreCase(user.getRole())
                || "MODERATOR".equalsIgnoreCase(user.getRole()) || "ROLE_MODERATOR".equalsIgnoreCase(user.getRole());

        // Allow decision owner, comment owner, or moderators/admins to delete
        if (!isModOrAdmin &&
            !comment.getUser().getId().equals(user.getId()) && 
            !comment.getDecision().getUser().getId().equals(user.getId())) {
            throw new CustomException("You are not authorized to delete this comment", HttpStatus.FORBIDDEN);
        }

        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setDecisionId(c.getDecision().getId());
        r.setUserId(c.getUser().getId());
        r.setUsername(c.getUser().getUsername());
        r.setUserFullName(c.getUser().getFullName());
        r.setCommentText(c.getCommentText());
        r.setParentCommentId(c.getParentComment() != null ? c.getParentComment().getId() : null);
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
