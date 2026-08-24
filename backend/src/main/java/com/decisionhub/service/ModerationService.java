package com.decisionhub.service;

import com.decisionhub.dto.ModerationFlagRequest;
import com.decisionhub.dto.ModerationFlagResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.ModerationFlag;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.ModerationFlagRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModerationService {

    private final ModerationFlagRepository moderationFlagRepository;
    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;

    public ModerationService(ModerationFlagRepository moderationFlagRepository,
                             UserRepository userRepository,
                             DecisionRepository decisionRepository,
                             CommentRepository commentRepository,
                             UserService userService) {
        this.moderationFlagRepository = moderationFlagRepository;
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
    }

    private void checkModeratorOrAdmin(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        String role = user.getRole() != null ? user.getRole().toUpperCase().trim() : "";
        if (!"MODERATOR".equals(role) && !"ADMIN".equals(role)) {
            throw new AccessDeniedException("Access denied. Only moderators or admins can access this resource.");
        }
    }

    @Transactional
    public ModerationFlagResponse flagContent(ModerationFlagRequest request, String userEmail) {
        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        // Verify target exists
        if ("DECISION".equalsIgnoreCase(request.getTargetType())) {
            if (!decisionRepository.existsById(request.getTargetId())) {
                throw new DecisionNotFoundException("Decision not found with id: " + request.getTargetId());
            }
        } else if ("COMMENT".equalsIgnoreCase(request.getTargetType())) {
            Comment comment = commentRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + request.getTargetId()));
            comment.setIsFlagged(true);
            commentRepository.save(comment);
        } else {
            throw new IllegalArgumentException("Invalid target type: " + request.getTargetType());
        }

        ModerationFlag flag = new ModerationFlag();
        flag.setTargetType(request.getTargetType().toUpperCase());
        flag.setTargetId(request.getTargetId());
        flag.setReportedBy(reporter);
        flag.setReason(request.getReason());
        flag.setStatus("PENDING");

        ModerationFlag saved = moderationFlagRepository.save(flag);
        return mapToModerationFlagResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ModerationFlagResponse> getAllPendingFlags(String userEmail) {
        checkModeratorOrAdmin(userEmail);
        return moderationFlagRepository.findByStatus("PENDING").stream()
                .map(this::mapToModerationFlagResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ModerationFlagResponse getFlagById(Long id, String userEmail) {
        checkModeratorOrAdmin(userEmail);
        ModerationFlag flag = moderationFlagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moderation flag not found with id: " + id));
        return mapToModerationFlagResponse(flag);
    }

    @Transactional
    public ModerationFlagResponse resolveFlag(Long id, String userEmail) {
        checkModeratorOrAdmin(userEmail);
        ModerationFlag flag = moderationFlagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moderation flag not found with id: " + id));

        flag.setStatus("RESOLVED");
        ModerationFlag saved = moderationFlagRepository.save(flag);

        // If target was a comment, remove flagged status
        if ("COMMENT".equalsIgnoreCase(flag.getTargetType())) {
            commentRepository.findById(flag.getTargetId()).ifPresent(comment -> {
                comment.setIsFlagged(false);
                commentRepository.save(comment);
            });
        }

        return mapToModerationFlagResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ModerationFlagResponse> getFlagsByTarget(String targetType, Long targetId, String userEmail) {
        checkModeratorOrAdmin(userEmail);
        return moderationFlagRepository.findByTargetTypeAndTargetId(targetType.toUpperCase(), targetId).stream()
                .map(this::mapToModerationFlagResponse)
                .collect(Collectors.toList());
    }

    public ModerationFlagResponse mapToModerationFlagResponse(ModerationFlag flag) {
        return new ModerationFlagResponse(
                flag.getId(),
                flag.getTargetType(),
                flag.getTargetId(),
                userService.mapToUserResponse(flag.getReportedBy()),
                flag.getReason(),
                flag.getStatus()
        );
    }
}
