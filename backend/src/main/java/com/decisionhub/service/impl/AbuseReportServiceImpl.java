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
import com.decisionhub.service.CommentService;
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
    private final CommentService commentService;
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

        if (deleteTarget) {
            if (report.getComment() != null) {
                User author = report.getComment().getUser();
                String decisionTitle = report.getComment().getDecision() != null ? report.getComment().getDecision().getTitle() : "a discussion";
                commentRepository.delete(report.getComment());
                if (author != null) {
                    notificationService.sendNotification(
                            author.getUserId(),
                            "Comment Removed",
                            "Your comment in \"" + decisionTitle + "\" was removed by administrators due to a reported violation (" + report.getReason() + ").",
                            com.decisionhub.common.enums.NotificationType.SYSTEM
                    );
                }
            } else if (report.getDecision() != null) {
                User author = report.getDecision().getCreatedBy();
                String decisionTitle = report.getDecision().getTitle();
                decisionService.deleteDecision(report.getDecision().getDecisionId(), userId);
                if (author != null) {
                    notificationService.sendNotification(
                            author.getUserId(),
                            "Decision Removed",
                            "Your decision board \"" + decisionTitle + "\" was removed by administrators due to a reported violation (" + report.getReason() + ").",
                            com.decisionhub.common.enums.NotificationType.SYSTEM
                    );
                }
            } else if (report.getCommunity() != null) {
                User owner = report.getCommunity().getOwner();
                String communityName = report.getCommunity().getName();
                communityService.deleteCommunity(report.getCommunity().getCommunityId(), userId);
                if (owner != null) {
                    notificationService.sendNotification(
                            owner.getUserId(),
                            "Community Removed",
                            "Your community \"" + communityName + "\" was removed by administrators due to a reported violation (" + report.getReason() + ").",
                            com.decisionhub.common.enums.NotificationType.SYSTEM
                    );
                }
            }
        }

        report.setStatus(deleteTarget ? AbuseReportStatus.RESOLVED : AbuseReportStatus.DISMISSED);
        report.setResolvedBy(user);
        
        AbuseReport savedReport = abuseReportRepository.save(report);

        String actionType = deleteTarget ? "REPORT_RESOLVED" : "REPORT_DISMISSED";
        String targetType = report.getComment() != null ? "COMMENT" : (report.getDecision() != null ? "DECISION" : "COMMUNITY");
        Long targetId = report.getComment() != null ? report.getComment().getCommentId() : (report.getDecision() != null ? report.getDecision().getDecisionId() : (report.getCommunity() != null ? report.getCommunity().getCommunityId() : null));
        String resolutionDetails = deleteTarget
                ? "Resolved report #" + reportId + " (" + report.getReason() + ") and deleted " + targetType.toLowerCase() + " #" + targetId
                : "Dismissed report #" + reportId + " (" + report.getReason() + ") as compliant";

        auditLogService.logAction(userId, actionType, "ABUSE_REPORT", reportId, resolutionDetails);

        return mapToResponse(savedReport);
    }

    private AbuseReportResponse mapToResponse(AbuseReport report) {
        UserResponse reportedBy = mapUserToResponse(report.getReportedBy());
        UserResponse resolvedBy = report.getResolvedBy() != null ? mapUserToResponse(report.getResolvedBy()) : null;
        
        Long decisionId = report.getDecision() != null ? report.getDecision().getDecisionId() : null;
        String decisionTitle = report.getDecision() != null ? report.getDecision().getTitle() : null;
        String decisionDescription = report.getDecision() != null ? report.getDecision().getDescription() : null;
        
        Long commentId = report.getComment() != null ? report.getComment().getCommentId() : null;
        String commentMessage = report.getComment() != null ? report.getComment().getMessage() : null;

        Long communityId = report.getCommunity() != null
                ? report.getCommunity().getCommunityId()
                : (report.getDecision() != null && report.getDecision().getCommunity() != null
                        ? report.getDecision().getCommunity().getCommunityId() : null);
        String communityName = report.getCommunity() != null
                ? report.getCommunity().getName()
                : (report.getDecision() != null && report.getDecision().getCommunity() != null
                        ? report.getDecision().getCommunity().getName() : null);
        String communityDescription = report.getCommunity() != null
                ? report.getCommunity().getDescription()
                : (report.getDecision() != null && report.getDecision().getCommunity() != null
                        ? report.getDecision().getCommunity().getDescription() : null);

        User targetAuthorUser = null;
        if (report.getComment() != null) {
            targetAuthorUser = report.getComment().getUser();
        } else if (report.getDecision() != null) {
            targetAuthorUser = report.getDecision().getCreatedBy();
        } else if (report.getCommunity() != null) {
            targetAuthorUser = report.getCommunity().getOwner();
        }
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
    }
}

