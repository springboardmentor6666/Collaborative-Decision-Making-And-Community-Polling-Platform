package com.decisionhub.service;

import com.decisionhub.dto.CommentReactionRequest;
import com.decisionhub.dto.CommentRequest;
import com.decisionhub.dto.CommentResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.CommentReaction;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.event.ActivityEvent;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.CommentReactionRepository;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    public CommentService(CommentRepository commentRepository,
                          CommentReactionRepository commentReactionRepository,
                          DecisionRepository decisionRepository,
                          UserRepository userRepository,
                          UserService userService,
                          ApplicationEventPublisher eventPublisher) {
        this.commentRepository = commentRepository;
        this.commentReactionRepository = commentReactionRepository;
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
        comment.setUpvotesCount(0);
        comment.setDownvotesCount(0);

        Comment savedComment = commentRepository.save(comment);

        if (eventPublisher != null) {
            Long commId = decision.getCommunity() != null ? decision.getCommunity().getId() : null;
            String vis = decision.getVisibility() != null ? decision.getVisibility() : "PUBLIC";
            String title = "Commented on: " + decision.getTitle();
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("decisionId", decision.getId());
            metadata.put("commentId", savedComment.getId());
            String snippet = savedComment.getContent() != null && savedComment.getContent().length() > 50
                    ? savedComment.getContent().substring(0, 50) + "..."
                    : savedComment.getContent();
            metadata.put("snippet", snippet);

            eventPublisher.publishEvent(new ActivityEvent(
                    author.getId(),
                    "COMMENT_ADDED",
                    "COMMENT",
                    savedComment.getId(),
                    commId,
                    title,
                    metadata,
                    vis
            ));
        }

        return mapToCommentResponse(savedComment, userEmail);
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
        reply.setUpvotesCount(0);
        reply.setDownvotesCount(0);

        Comment savedReply = commentRepository.save(reply);
        return mapToCommentResponse(savedReply, userEmail);
    }

    @Transactional
    public CommentResponse toggleReaction(Long commentId, CommentReactionRequest request, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + commentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        String reactionType = request.getReactionType().toUpperCase().trim();
        if (!"UPVOTE".equals(reactionType) && !"DOWNVOTE".equals(reactionType)) {
            throw new IllegalArgumentException("Reaction type must be either UPVOTE or DOWNVOTE");
        }

        Optional<CommentReaction> existingOpt = commentReactionRepository.findByCommentIdAndUserId(commentId, user.getId());

        int upvotes = comment.getUpvotesCount();
        int downvotes = comment.getDownvotesCount();

        if (existingOpt.isPresent()) {
            CommentReaction existing = existingOpt.get();
            if (existing.getReactionType().equalsIgnoreCase(reactionType)) {
                // Toggle off (remove reaction)
                commentReactionRepository.delete(existing);
                if ("UPVOTE".equals(reactionType)) {
                    upvotes = Math.max(0, upvotes - 1);
                } else {
                    downvotes = Math.max(0, downvotes - 1);
                }
            } else {
                // Switching from UPVOTE to DOWNVOTE or vice-versa
                existing.setReactionType(reactionType);
                commentReactionRepository.save(existing);
                if ("UPVOTE".equals(reactionType)) {
                    upvotes += 1;
                    downvotes = Math.max(0, downvotes - 1);
                } else {
                    downvotes += 1;
                    upvotes = Math.max(0, upvotes - 1);
                }
            }
        } else {
            // New reaction
            CommentReaction newReaction = new CommentReaction(comment, user, reactionType);
            commentReactionRepository.save(newReaction);
            if ("UPVOTE".equals(reactionType)) {
                upvotes += 1;
            } else {
                downvotes += 1;
            }
        }

        comment.setUpvotesCount(upvotes);
        comment.setDownvotesCount(downvotes);
        Comment savedComment = commentRepository.save(comment);

        return mapToCommentResponse(savedComment, userEmail);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByDecisionId(Long decisionId) {
        return getCommentsByDecisionId(decisionId, "top", null);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByDecisionId(Long decisionId, String sortBy, String userEmail) {
        if (!decisionRepository.existsById(decisionId)) {
            throw new DecisionNotFoundException("Decision not found with id: " + decisionId);
        }

        List<Comment> rootComments;
        if ("newest".equalsIgnoreCase(sortBy)) {
            rootComments = commentRepository.findByDecisionIdAndParentIsNull(decisionId, Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            rootComments = commentRepository.findByDecisionIdAndParentIsNull(decisionId, Sort.by(Sort.Direction.ASC, "createdAt"));
        } else {
            // "top" default: sort by score = (upvotesCount - downvotesCount) DESC, then createdAt DESC
            rootComments = commentRepository.findByDecisionIdAndParentIsNull(decisionId);
            rootComments.sort((c1, c2) -> {
                int score1 = c1.getScore();
                int score2 = c2.getScore();
                if (score1 != score2) {
                    return Integer.compare(score2, score1);
                }
                if (c1.getCreatedAt() != null && c2.getCreatedAt() != null) {
                    return c2.getCreatedAt().compareTo(c1.getCreatedAt());
                }
                return 0;
            });
        }

        return rootComments.stream()
                .map(c -> mapToCommentResponse(c, userEmail))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getRepliesByCommentId(Long parentId) {
        return getRepliesByCommentId(parentId, null);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getRepliesByCommentId(Long parentId, String userEmail) {
        if (!commentRepository.existsById(parentId)) {
            throw new IllegalArgumentException("Comment not found with id: " + parentId);
        }
        return commentRepository.findByParentId(parentId).stream()
                .map(c -> mapToCommentResponse(c, userEmail))
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
        return mapToCommentResponse(updatedComment, userEmail);
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

    public CommentResponse mapToCommentResponse(Comment comment) {
        return mapToCommentResponse(comment, null);
    }

    public CommentResponse mapToCommentResponse(Comment comment, String userEmail) {
        Integer replyCount = (comment.getReplies() != null) ? comment.getReplies().size() : 0;
        Long parentId = (comment.getParent() != null) ? comment.getParent().getId() : null;

        String userReaction = null;
        if (userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                userReaction = commentReactionRepository.findByCommentIdAndUserId(comment.getId(), user.getId())
                        .map(CommentReaction::getReactionType)
                        .orElse(null);
            }
        }

        CommentResponse response = new CommentResponse(
                comment.getId(),
                comment.getDecision().getId(),
                parentId,
                comment.getContent(),
                comment.getCreatedAt(),
                userService.mapToUserResponse(comment.getAuthor()),
                comment.getIsFlagged(),
                replyCount,
                comment.getUpvotesCount(),
                comment.getDownvotesCount(),
                comment.getScore(),
                userReaction
        );

        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentResponse> replyResponses = comment.getReplies().stream()
                    .map(r -> mapToCommentResponse(r, userEmail))
                    .collect(Collectors.toList());
            response.setReplies(replyResponses);
        } else {
            response.setReplies(new ArrayList<>());
        }

        return response;
    }
}
