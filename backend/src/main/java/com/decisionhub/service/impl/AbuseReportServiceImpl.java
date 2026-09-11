package com.decisionhub.service.impl;

import com.decisionhub.common.enums.AbuseReportStatus;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.dto.request.AbuseReportRequest;
import com.decisionhub.dto.response.AbuseReportResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.AbuseReport;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.repository.AbuseReportRepository;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.AbuseReportService;
import com.decisionhub.service.AuditLogService;
import com.decisionhub.service.CommunityService;
import com.decisionhub.service.DecisionService;
import com.decisionhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AbuseReportServiceImpl implements AbuseReportService {

    private final AbuseReportRepository abuseReportRepository;
    private final DecisionRepository decisionRepository;
    private final CommentRepository commentRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final DecisionService decisionService;
    private final CommunityService communityService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public AbuseReportResponse reportDecision(Long decisionId, AbuseReportRequest request, Long userId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        AbuseReport report = AbuseReport.builder()
                .decision(decision)
                .reportedBy(user)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(AbuseReportStatus.PENDING)
                .build();

        AbuseReport savedReport = abuseReportRepository.save(report);
        auditLogService.logAction(userId, "REPORT_SUBMITTED", "DECISION", decisionId, "Reported decision \"" + decision.getTitle() + "\" for: " + request.getReason());
        return mapToResponse(savedReport);
    }

    @Override
    @Transactional
    public AbuseReportResponse reportComment(Long commentId, AbuseReportRequest request, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment", "id", commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        AbuseReport report = AbuseReport.builder()
                .decision(comment.getDecision())
                .comment(comment)
                .reportedBy(user)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(AbuseReportStatus.PENDING)
                .build();

        AbuseReport savedReport = abuseReportRepository.save(report);
        auditLogService.logAction(userId, "REPORT_SUBMITTED", "COMMENT", commentId, "Reported comment for: " + request.getReason());
        return mapToResponse(savedReport);
    }

    @Override
    @Transactional
    public AbuseReportResponse reportCommunity(Long communityId, AbuseReportRequest request, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        AbuseReport report = AbuseReport.builder()
                .community(community)
                .reportedBy(user)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(AbuseReportStatus.PENDING)
                .build();

        AbuseReport savedReport = abuseReportRepository.save(report);
        auditLogService.logAction(userId, "REPORT_SUBMITTED", "COMMUNITY", communityId, "Reported community \"" + community.getName() + "\" for: " + request.getReason());
        return mapToResponse(savedReport);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AbuseReportResponse> getReportsForCommunity(Long communityId, AbuseReportStatus status, Pageable pageable, Long userId) {
        // Check if user is owner or moderator
        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .orElseThrow(() -> new AccessDeniedException("Not a member of this community"));

        if (member.getMemberRole() != MemberRole.OWNER && member.getMemberRole() != MemberRole.MODERATOR) {
            throw new AccessDeniedException("Only community admins can view reports");
        }

        Page<AbuseReport> reports;
        if (status != null) {
            reports = abuseReportRepository.findByCommunityIdAndStatus(communityId, status, pageable);
        } else {
            reports = abuseReportRepository.findByCommunityId(communityId, pageable);
        }

        return reports.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AbuseReportResponse> getGlobalReports(AbuseReportStatus status, Pageable pageable) {
        // System admin check is handled by controller security annotations
        Page<AbuseReport> reports;
        if (status != null) {
            reports = abuseReportRepository.findByStatus(status, pageable);
        } else {
            reports = abuseReportRepository.findAll(pageable);
        }
        return reports.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public AbuseReportResponse resolveReport(Long reportId, boolean deleteTarget, Long userId) {
        AbuseReport report = abuseReportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("AbuseReport", "id", reportId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        // Check rights: Must be system admin or community owner/moderator
        boolean hasRights = false;
        if (RoleType.ROLE_ADMIN.equals(user.getRole().getRoleName())) {
            hasRights = true;
        } else if (report.getCommunity() != null) {
            CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(report.getCommunity().getCommunityId(), userId)
                    .orElse(null);
            if (member != null && (member.getMemberRole() == MemberRole.OWNER || member.getMemberRole() == MemberRole.MODERATOR)) {
                hasRights = true;
            }
        } else if (report.getDecision() != null) {
            Community community = report.getDecision().getCommunity();
            if (community != null) {
                CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(community.getCommunityId(), userId)
                        .orElse(null);
                if (member != null && (member.getMemberRole() == MemberRole.OWNER || member.getMemberRole() == MemberRole.MODERATOR)) {
                    hasRights = true;
                }
            }
        }

        if (!hasRights) {
            throw new AccessDeniedException("You do not have permission to resolve this report");
        }

        // Capture snapshot details before potential deletion so references are preserved for response and audit
        Long snapshotDecisionId = report.getDecision() != null ? report.getDecision().getDecisionId() : null;
        String snapshotDecisionTitle = report.getDecision() != null ? report.getDecision().getTitle() : null;
        String snapshotDecisionDesc = report.getDecision() != null ? report.getDecision().getDescription() : null;
        User snapshotDecisionAuthor = report.getDecision() != null ? report.getDecision().getCreatedBy() : null;

        Long snapshotCommentId = report.getComment() != null ? report.getComment().getCommentId() : null;
        String snapshotCommentMsg = report.getComment() != null ? report.getComment().getMessage() : null;
        User snapshotCommentAuthor = report.getComment() != null ? report.getComment().getUser() : null;

        Long snapshotCommunityId = null;
        String snapshotCommunityName = null;
        String snapshotCommunityDesc = null;
        User snapshotCommunityOwner = null;
        if (report.getCommunity() != null) {
            snapshotCommunityId = report.getCommunity().getCommunityId();
            snapshotCommunityName = report.getCommunity().getName();
            snapshotCommunityDesc = report.getCommunity().getDescription();
            snapshotCommunityOwner = report.getCommunity().getOwner();
        } else if (report.getDecision() != null && report.getDecision().getCommunity() != null) {
            snapshotCommunityId = report.getDecision().getCommunity().getCommunityId();
            snapshotCommunityName = report.getDecision().getCommunity().getName();
            snapshotCommunityDesc = report.getDecision().getCommunity().getDescription();
        }

        User targetAuthorUser = snapshotCommentAuthor != null ? snapshotCommentAuthor : (snapshotDecisionAuthor != null ? snapshotDecisionAuthor : snapshotCommunityOwner);
        UserResponse targetAuthor = targetAuthorUser != null ? mapUserToResponse(targetAuthorUser) : null;

        if (deleteTarget) {
            if (report.getComment() != null) {
                Comment commentToDelete = report.getComment();
                report.setComment(null);
                commentRepository.delete(commentToDelete);
                if (snapshotCommentAuthor != null) {
                    String title = snapshotDecisionTitle != null ? snapshotDecisionTitle : "a discussion";
                    notificationService.sendNotification(
                            snapshotCommentAuthor.getUserId(),
                            "Comment Removed",
                            "Your comment in \"" + title + "\" was removed by administrators due to a reported violation (" + report.getReason() + ").",
                            com.decisionhub.common.enums.NotificationType.SYSTEM
                    );
                }
            } else if (report.getDecision() != null) {
                Long decisionIdToDelete = report.getDecision().getDecisionId();
                report.setDecision(null);
                decisionService.deleteDecision(decisionIdToDelete, userId);
                if (snapshotDecisionAuthor != null) {
                    notificationService.sendNotification(
                            snapshotDecisionAuthor.getUserId(),
                            "Decision Removed",
                            "Your decision board \"" + snapshotDecisionTitle + "\" was removed by administrators due to a reported violation (" + report.getReason() + ").",
                            com.decisionhub.common.enums.NotificationType.SYSTEM
                    );
                }
            } else if (report.getCommunity() != null) {
                Long communityIdToDelete = report.getCommunity().getCommunityId();
                report.setCommunity(null);
                communityService.deleteCommunity(communityIdToDelete, userId);
                if (snapshotCommunityOwner != null) {
                    notificationService.sendNotification(
                            snapshotCommunityOwner.getUserId(),
                            "Community Removed",
                            "Your community \"" + snapshotCommunityName + "\" was removed by administrators due to a reported violation (" + report.getReason() + ").",
                            com.decisionhub.common.enums.NotificationType.SYSTEM
                    );
                }
            }
        }

        report.setStatus(deleteTarget ? AbuseReportStatus.RESOLVED : AbuseReportStatus.DISMISSED);
        report.setResolvedBy(user);
        
        AbuseReport savedReport = abuseReportRepository.save(report);

        String actionType = deleteTarget ? "REPORT_RESOLVED" : "REPORT_DISMISSED";
        String targetType = snapshotCommentId != null ? "COMMENT" : (snapshotDecisionId != null ? "DECISION" : "COMMUNITY");
        Long targetId = snapshotCommentId != null ? snapshotCommentId : (snapshotDecisionId != null ? snapshotDecisionId : snapshotCommunityId);
        String resolutionDetails = deleteTarget
                ? "Resolved report #" + reportId + " (" + report.getReason() + ") and deleted " + targetType.toLowerCase() + " #" + targetId
                : "Dismissed report #" + reportId + " (" + report.getReason() + ") as compliant";

        auditLogService.logAction(userId, actionType, "ABUSE_REPORT", reportId, resolutionDetails);

        return AbuseReportResponse.builder()
                .reportId(savedReport.getReportId())
                .decisionId(snapshotDecisionId)
                .decisionTitle(snapshotDecisionTitle)
                .decisionDescription(snapshotDecisionDesc)
                .commentId(snapshotCommentId)
                .commentMessage(snapshotCommentMsg)
                .communityId(snapshotCommunityId)
                .communityName(snapshotCommunityName)
                .communityDescription(snapshotCommunityDesc)
                .targetAuthor(targetAuthor)
                .reportedBy(mapUserToResponse(savedReport.getReportedBy()))
                .reason(savedReport.getReason())
                .description(savedReport.getDescription())
                .status(savedReport.getStatus())
                .resolvedBy(mapUserToResponse(savedReport.getResolvedBy()))
                .createdAt(savedReport.getCreatedAt())
                .updatedAt(savedReport.getUpdatedAt())
                .build();
    }

    private AbuseReportResponse mapToResponse(AbuseReport report) {
        UserResponse reportedBy = mapUserToResponse(report.getReportedBy());
        UserResponse resolvedBy = report.getResolvedBy() != null ? mapUserToResponse(report.getResolvedBy()) : null;
        
        Long decisionId = null;
        String decisionTitle = null;
        String decisionDescription = null;
        try {
            if (report.getDecision() != null) {
                decisionId = report.getDecision().getDecisionId();
                decisionTitle = report.getDecision().getTitle();
                decisionDescription = report.getDecision().getDescription();
            }
        } catch (Exception ignored) {}
        
        Long commentId = null;
        String commentMessage = null;
        try {
            if (report.getComment() != null) {
                commentId = report.getComment().getCommentId();
                commentMessage = report.getComment().getMessage();
            }
        } catch (Exception ignored) {}

        Long communityId = null;
        String communityName = null;
        String communityDescription = null;
        try {
            if (report.getCommunity() != null) {
                communityId = report.getCommunity().getCommunityId();
                communityName = report.getCommunity().getName();
                communityDescription = report.getCommunity().getDescription();
            } else if (report.getDecision() != null && report.getDecision().getCommunity() != null) {
                communityId = report.getDecision().getCommunity().getCommunityId();
                communityName = report.getDecision().getCommunity().getName();
                communityDescription = report.getDecision().getCommunity().getDescription();
            }
        } catch (Exception ignored) {}

        User targetAuthorUser = null;
        try {
            if (report.getComment() != null && report.getComment().getUser() != null) {
                targetAuthorUser = report.getComment().getUser();
            } else if (report.getDecision() != null && report.getDecision().getCreatedBy() != null) {
                targetAuthorUser = report.getDecision().getCreatedBy();
            } else if (report.getCommunity() != null && report.getCommunity().getOwner() != null) {
                targetAuthorUser = report.getCommunity().getOwner();
            }
        } catch (Exception ignored) {}
        UserResponse targetAuthor = targetAuthorUser != null ? mapUserToResponse(targetAuthorUser) : null;

        return AbuseReportResponse.builder()
                .reportId(report.getReportId())
                .decisionId(decisionId)
                .decisionTitle(decisionTitle)
                .decisionDescription(decisionDescription)
                .commentId(commentId)
                .commentMessage(commentMessage)
                .communityId(communityId)
                .communityName(communityName)
                .communityDescription(communityDescription)
                .targetAuthor(targetAuthor)
                .reportedBy(reportedBy)
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .resolvedBy(resolvedBy)
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
    
    private UserResponse mapUserToResponse(User user) {
        if (user == null) return null;
        try {
            return UserResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .profileImage(user.getProfileImage())
                    .role(user.getRole() != null ? user.getRole().getRoleName() : null)
                    .accountStatus(user.getAccountStatus())
                    .createdAt(user.getCreatedAt())
                    .build();
        } catch (Exception e) {
            return null;
        }
    }
}

