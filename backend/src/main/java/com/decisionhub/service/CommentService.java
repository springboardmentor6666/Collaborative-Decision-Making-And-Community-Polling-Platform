package com.decisionhub.service;

import com.decisionhub.dto.CommentRequest;
import com.decisionhub.dto.CommentResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public CommentService(CommentRepository commentRepository, 
                          DecisionRepository decisionRepository,
                          UserRepository userRepository,
                          UserService userService,
                          org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.commentRepository = commentRepository;
        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public CommentResponse createComment(CommentRequest request, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        
        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + request.getDecisionId()));

        Comment comment = new Comment();
        comment.setDecision(decision);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        Comment savedComment = commentRepository.save(comment);

        if (decision.getOwner() != null && !decision.getOwner().getId().equals(author.getId())) {
            String msg = author.getFullName() + " commented on your decision: " + decision.getTitle();
            eventPublisher.publishEvent(new com.decisionhub.event.NotificationEvent(this, decision.getOwner(), "NEW_COMMENT", msg, "New Comment on your Decision"));
        }

        return mapToCommentResponse(savedComment);
    }

    @Transactional
    public CommentResponse replyToComment(Long parentId, CommentRequest request, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        Comment parentComment = commentRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent comment not found with id: " + parentId));

        if (!parentComment.getDecision().getId().equals(request.getDecisionId())) {
            throw new IllegalArgumentException("Parent discussion does not belong to the specified decision");
        }

        Comment reply = new Comment();
        reply.setDecision(parentComment.getDecision());
        reply.setAuthor(author);
        reply.setParent(parentComment);
        reply.setContent(request.getContent());

        Comment savedReply = commentRepository.save(reply);

        if (parentComment.getAuthor() != null && !parentComment.getAuthor().getId().equals(author.getId())) {
            String msg = author.getFullName() + " replied to your comment on decision: " + parentComment.getDecision().getTitle();
            eventPublisher.publishEvent(new com.decisionhub.event.NotificationEvent(this, parentComment.getAuthor(), "COMMENT_REPLY", msg, "New Reply to your Comment"));
        }

        return mapToCommentResponse(savedReply);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByDecisionId(Long decisionId) {
        if (!decisionRepository.existsById(decisionId)) {
            throw new DecisionNotFoundException("Decision not found with id: " + decisionId);
        }
        return commentRepository.findByDecisionIdAndParentIsNull(decisionId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getRepliesByCommentId(Long parentId) {
        if (!commentRepository.existsById(parentId)) {
            throw new IllegalArgumentException("Comment not found with id: " + parentId);
        }
        return commentRepository.findByParentId(parentId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse updateComment(Long id, CommentRequest request, String userEmail) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + id));

        if (!comment.getAuthor().getEmail().equals(userEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to edit this comment");
        }

        comment.setContent(request.getContent());
        Comment updatedComment = commentRepository.save(comment);
        return mapToCommentResponse(updatedComment);
    }

    @Transactional
    public void deleteComment(Long id, String userEmail) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + id));

        User requestingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        boolean isAuthor = comment.getAuthor().getEmail().equals(userEmail);
        boolean isModeratorOrAdmin = requestingUser.getRole().equalsIgnoreCase("MODERATOR") 
                                  || requestingUser.getRole().equalsIgnoreCase("ADMIN");

        if (!isAuthor && !isModeratorOrAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        Integer replyCount = (comment.getReplies() != null) ? comment.getReplies().size() : 0;
        Long parentId = (comment.getParent() != null) ? comment.getParent().getId() : null;

        CommentResponse response = new CommentResponse(
                comment.getId(),
                comment.getDecision().getId(),
                parentId,
                comment.getContent(),
                comment.getCreatedAt(),
                userService.mapToUserResponse(comment.getAuthor()),
                comment.getIsFlagged(),
                replyCount
        );

        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentResponse> replyResponses = comment.getReplies().stream()
                    .map(this::mapToCommentResponse)
                    .collect(Collectors.toList());
            response.setReplies(replyResponses);
        } else {
            response.setReplies(new java.util.ArrayList<>());
        }

        return response;
    }
}
