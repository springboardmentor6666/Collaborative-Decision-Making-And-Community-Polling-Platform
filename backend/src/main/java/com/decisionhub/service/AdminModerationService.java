package com.decisionhub.service;

import com.decisionhub.dto.ModerationActionRequest;
import com.decisionhub.dto.ReportDetailResponse;
import com.decisionhub.entity.*;
import com.decisionhub.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AdminModerationService
 * Architecture Tier: Business Service (Service Tier)
 * Package: com.decisionhub.service
 *
 * Purpose:
 *   Business service for administrative moderation workflows, processing abuse reports, applying sanctions, and updating content flags.
 */
@Service
public class AdminModerationService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final CommentRepository commentRepository;
    private final CommunityMessageRepository communityMessageRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AdminModerationService(ReportRepository reportRepository,
                                  UserRepository userRepository,
                                  DecisionRepository decisionRepository,
                                  CommentRepository commentRepository,
                                  CommunityMessageRepository communityMessageRepository,
                                  NotificationService notificationService,
                                  AuditLogService auditLogService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.commentRepository = commentRepository;
        this.communityMessageRepository = communityMessageRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<ReportDetailResponse> getReportsPaged(String status, String contentType, String search, Pageable pageable) {
        String sanitizedStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) 
                ? status.trim().toUpperCase() : null;
        String sanitizedType = (contentType != null && !contentType.isBlank() && !"ALL".equalsIgnoreCase(contentType.trim())) 
                ? contentType.trim().toUpperCase() : null;
        String sanitizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Report> reports = reportRepository.findWithFilters(sanitizedStatus, sanitizedType, sanitizedSearch, pageable);
        return reports.map(this::mapToDetailResponse);
    }

    @Transactional(readOnly = true)
    public ReportDetailResponse getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + id));
        return mapToDetailResponse(report);
    }

    @Transactional(readOnly = true)
    public List<ReportDetailResponse> getUserSubmittedReports(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReportDetailResponse> getUserModerationNotices(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        return reportRepository.findByReportedUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(r -> r.getModerationAction() != null && !r.getModerationAction().isBlank())
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportDetailResponse submitReport(Map<String, Object> body, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + reporterEmail));

        String reason = (String) body.get("reason");
        String description = (String) body.get("description");
        String contentType = (String) body.get("contentType");
        Long contentId = body.get("contentId") != null ? Long.valueOf(body.get("contentId").toString()) : null;

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Report reason is required");
        }
        if (contentType == null || contentType.isBlank()) {
            contentType = "DECISION";
        }

        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(reason.trim());
        report.setDescription(description != null ? description.trim() : null);
        report.setContentType(contentType.toUpperCase());
        report.setContentId(contentId);
        report.setStatus("PENDING");

        // Identify creator / reported user based on content
        User creator = resolveContentCreator(contentType.toUpperCase(), contentId);
        if (creator != null) {
            report.setReportedUser(creator);
        } else if (body.get("reportedUserId") != null) {
            userRepository.findById(Long.valueOf(body.get("reportedUserId").toString())).ifPresent(report::setReportedUser);
        }

        Report saved = reportRepository.save(report);

        // Notify reporter that report was received
        notificationService.createNotification(
                reporter,
                "SYSTEM",
                "Your report on " + contentType.toLowerCase() + " #" + (contentId != null ? contentId : "") + " has been submitted for review."
        );

        return mapToDetailResponse(saved);
    }

    @Transactional
    public ReportDetailResponse moderateReport(Long reportId, ModerationActionRequest request, String adminEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + reportId));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found: " + adminEmail));

        String action = request.getAction() != null ? request.getAction().trim().toUpperCase() : "NO_ACTION";
        String customReason = (request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim()
                : "Content complies with standard platform policy.";
        String internalNote = request.getInternalNote();

        String prevStatus = report.getStatus();
        report.setReviewedBy(admin);
        report.setReviewedAt(LocalDateTime.now());
        report.setModerationAction(action);
        report.setModerationReason(customReason);

        User creator = report.getReportedUser() != null 
                ? report.getReportedUser() 
                : resolveContentCreator(report.getContentType(), report.getContentId());

        String contentTitle = resolveContentTitle(report.getContentType(), report.getContentId());

        switch (action) {
            case "NO_ACTION":
                report.setStatus("NO_ACTION");
                // Respectful message to creator explaining review was completed and content is fine
                if (creator != null) {
                    notificationService.createNotification(
                            creator,
                            "SYSTEM",
                            "A report regarding your " + report.getContentType().toLowerCase() + " (\"" + contentTitle + "\") was reviewed. No violation was found and your content remains active. Perspectives vary across our community."
                    );
                }
                // Update reporter
                if (report.getReporter() != null) {
                    notificationService.createNotification(
                            report.getReporter(),
                            "SYSTEM",
                            "Your report on " + report.getContentType().toLowerCase() + " #" + report.getContentId() + " was reviewed. The moderation team determined no violation occurred."
                    );
                }
                auditLogService.logAction(adminEmail, "MODERATE_NO_ACTION", "REPORT", reportId, "No action taken on report #" + reportId + ". " + customReason);
                break;

            case "TEMPORARY_REMOVAL":
                report.setStatus("TEMPORARILY_REMOVED");
                applyTemporaryRemoval(report.getContentType(), report.getContentId(), true);

                if (creator != null) {
                    notificationService.createNotification(
                            creator,
                            "SYSTEM",
                            "Your " + report.getContentType().toLowerCase() + " (\"" + contentTitle + "\") was temporarily hidden by moderators. Reason: " + customReason + ". Please edit your content to comply with community standards."
                    );
                }
                if (report.getReporter() != null) {
                    notificationService.createNotification(
                            report.getReporter(),
                            "SYSTEM",
                            "Your report on " + report.getContentType().toLowerCase() + " #" + report.getContentId() + " was reviewed. The content has been temporarily removed."
                    );
                }
                auditLogService.logAction(adminEmail, "MODERATE_TEMPORARY_REMOVAL", "REPORT", reportId, "Temporarily removed " + report.getContentType() + " #" + report.getContentId() + ". Reason: " + customReason);
                break;

            case "DIRECT_REMOVE":
                report.setStatus("CONTENT_REMOVED");
                applyPermanentRemoval(report.getContentType(), report.getContentId());

                if (creator != null) {
                    notificationService.createNotification(
                            creator,
                            "SYSTEM",
                            "Your " + report.getContentType().toLowerCase() + " (\"" + contentTitle + "\") has been permanently removed due to policy violations. Reason: " + customReason
                    );
                }
                if (report.getReporter() != null) {
                    notificationService.createNotification(
                            report.getReporter(),
                            "SYSTEM",
                            "Thank you. Your report on " + report.getContentType().toLowerCase() + " #" + report.getContentId() + " was resolved and the content was removed."
                    );
                }
                auditLogService.logAction(adminEmail, "MODERATE_DIRECT_REMOVE", "REPORT", reportId, "Permanently removed " + report.getContentType() + " #" + report.getContentId() + ". Reason: " + customReason);
                break;

            case "RESTORE":
                report.setStatus("RESTORED");
                applyTemporaryRemoval(report.getContentType(), report.getContentId(), false);

                if (creator != null) {
                    notificationService.createNotification(
                            creator,
                            "SYSTEM",
                            "Good news! Your " + report.getContentType().toLowerCase() + " (\"" + contentTitle + "\") has been restored and is now active on DecisionHub."
                    );
                }
                auditLogService.logAction(adminEmail, "MODERATE_RESTORE", "REPORT", reportId, "Restored " + report.getContentType() + " #" + report.getContentId());
                break;

            default:
                report.setStatus("RESOLVED");
                auditLogService.logAction(adminEmail, "RESOLVE_REPORT", "REPORT", reportId, "Resolved report #" + reportId);
                break;
        }

        Report saved = reportRepository.save(report);
        return mapToDetailResponse(saved);
    }

    @Transactional
    public ReportDetailResponse resolveReport(Long reportId, String adminEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + reportId));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found: " + adminEmail));

        report.setStatus("RESOLVED");
        report.setReviewedBy(admin);
        report.setReviewedAt(LocalDateTime.now());
        report.setModerationAction("NO_ACTION");
        report.setModerationReason("Resolved by administrator.");

        Report saved = reportRepository.save(report);
        auditLogService.logAction(adminEmail, "RESOLVE_REPORT", "REPORT", reportId, "Marked report #" + reportId + " as resolved");
        return mapToDetailResponse(saved);
    }

    @Transactional
    public void deleteReport(Long reportId, String userEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + reportId));

        User requestingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        boolean isReporter = report.getReporter() != null &&
                report.getReporter().getEmail() != null &&
                report.getReporter().getEmail().trim().equalsIgnoreCase(userEmail.trim());

        boolean isModeratorOrAdmin = requestingUser.getRole() != null && (
                requestingUser.getRole().equalsIgnoreCase("MODERATOR") ||
                requestingUser.getRole().equalsIgnoreCase("ADMIN") ||
                requestingUser.getRole().toUpperCase().contains("ADMIN") ||
                requestingUser.getRole().toUpperCase().contains("MODERATOR") ||
                requestingUser.getRole().toUpperCase().contains("SUPERADMIN")
        );

        if (!isReporter && !isModeratorOrAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to delete this report");
        }

        reportRepository.delete(report);
        auditLogService.logAction(userEmail, "DELETE_REPORT", "REPORT", reportId, "Deleted report #" + reportId);
    }

    private void applyTemporaryRemoval(String contentType, Long contentId, boolean hide) {
        if (contentId == null || contentType == null) return;
        switch (contentType.toUpperCase()) {
            case "DECISION":
                decisionRepository.findById(contentId).ifPresent(d -> {
                    d.setStatus(hide ? "TEMPORARILY_REMOVED" : "OPEN");
                    decisionRepository.save(d);
                });
                break;
            case "COMMENT":
                commentRepository.findById(contentId).ifPresent(c -> {
                    c.setIsFlagged(hide);
                    commentRepository.save(c);
                });
                break;
            case "DISCUSSION":
            case "COMMUNITY_MESSAGE":
                communityMessageRepository.findById(contentId).ifPresent(m -> {
                    m.setIsEdited(hide);
                    communityMessageRepository.save(m);
                });
                break;
        }
    }

    private void applyPermanentRemoval(String contentType, Long contentId) {
        if (contentId == null || contentType == null) return;
        switch (contentType.toUpperCase()) {
            case "DECISION":
                decisionRepository.findById(contentId).ifPresent(d -> {
                    d.setIsDeleted(true);
                    decisionRepository.save(d);
                });
                break;
            case "COMMENT":
                commentRepository.findById(contentId).ifPresent(c -> {
                    c.setContent("[This comment was removed by moderation]");
                    c.setIsFlagged(true);
                    commentRepository.save(c);
                });
                break;
            case "DISCUSSION":
            case "COMMUNITY_MESSAGE":
                communityMessageRepository.findById(contentId).ifPresent(m -> {
                    m.setIsDeleted(true);
                    communityMessageRepository.save(m);
                });
                break;
        }
    }

    private User resolveContentCreator(String contentType, Long contentId) {
        if (contentId == null || contentType == null) return null;
        try {
            switch (contentType.toUpperCase()) {
                case "DECISION":
                    return decisionRepository.findById(contentId).map(Decision::getOwner).orElse(null);
                case "COMMENT":
                    return commentRepository.findById(contentId).map(Comment::getAuthor).orElse(null);
                case "DISCUSSION":
                case "COMMUNITY_MESSAGE":
                    return communityMessageRepository.findById(contentId).map(CommunityMessage::getSender).orElse(null);
                case "USER":
                    return userRepository.findById(contentId).orElse(null);
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private String resolveContentTitle(String contentType, Long contentId) {
        if (contentId == null || contentType == null) return "Content #" + contentId;
        try {
            switch (contentType.toUpperCase()) {
                case "DECISION":
                    return decisionRepository.findById(contentId).map(Decision::getTitle).orElse("Decision #" + contentId);
                case "COMMENT":
                    return commentRepository.findById(contentId).map(c -> {
                        String txt = c.getContent();
                        return txt.length() > 40 ? txt.substring(0, 37) + "..." : txt;
                    }).orElse("Comment #" + contentId);
                case "DISCUSSION":
                case "COMMUNITY_MESSAGE":
                    return communityMessageRepository.findById(contentId).map(m -> {
                        String txt = m.getContent();
                        return txt.length() > 40 ? txt.substring(0, 37) + "..." : txt;
                    }).orElse("Discussion Message #" + contentId);
            }
        } catch (Exception e) {
            return "Content #" + contentId;
        }
        return "Content #" + contentId;
    }

    public ReportDetailResponse mapToDetailResponse(Report report) {
        ReportDetailResponse dto = new ReportDetailResponse();
        dto.setId(report.getId());
        dto.setContentType(report.getContentType());
        dto.setContentId(report.getContentId());
        dto.setReason(report.getReason());
        dto.setDescription(report.getDescription());
        dto.setStatus(report.getStatus());
        dto.setModerationAction(report.getModerationAction());
        dto.setModerationReason(report.getModerationReason());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());

        // Reporter
        if (report.getReporter() != null) {
            dto.setReporterId(report.getReporter().getId());
            dto.setReporterName(report.getReporter().getFullName() != null ? report.getReporter().getFullName() : report.getReporter().getEmail());
            dto.setReporterEmail(report.getReporter().getEmail());
            dto.setReporterAvatar(report.getReporter().getProfileImage());
        }

        // Creator / Reported User
        User creator = report.getReportedUser() != null 
                ? report.getReportedUser() 
                : resolveContentCreator(report.getContentType(), report.getContentId());

        if (creator != null) {
            dto.setReportedUserId(creator.getId());
            dto.setReportedUserName(creator.getFullName() != null ? creator.getFullName() : creator.getEmail());
            dto.setReportedUserEmail(creator.getEmail());
            dto.setReportedUserAvatar(creator.getProfileImage());
        }

        // Reviewer
        if (report.getReviewedBy() != null) {
            dto.setReviewedByEmail(report.getReviewedBy().getEmail());
            dto.setReviewedByName(report.getReviewedBy().getFullName() != null ? report.getReviewedBy().getFullName() : report.getReviewedBy().getEmail());
            dto.setReviewedAt(report.getReviewedAt());
        }

        // Content Snapshot
        enrichContentSnapshot(dto, report.getContentType(), report.getContentId());

        return dto;
    }

    private void enrichContentSnapshot(ReportDetailResponse dto, String contentType, Long contentId) {
        if (contentId == null || contentType == null) {
            dto.setContentExists(false);
            return;
        }

        try {
            switch (contentType.toUpperCase()) {
                case "DECISION":
                    decisionRepository.findById(contentId).ifPresentOrElse(d -> {
                        dto.setContentExists(!Boolean.TRUE.equals(d.getIsDeleted()));
                        dto.setContentTitle(d.getTitle());
                        dto.setContentSnippet(d.getDescription());
                        dto.setContentStatus(d.getStatus());
                        dto.setContentUrl("/decisions/" + d.getId());
                        dto.setContentTemporarilyHidden("TEMPORARILY_REMOVED".equalsIgnoreCase(d.getStatus()));
                    }, () -> dto.setContentExists(false));
                    break;

                case "COMMENT":
                    commentRepository.findById(contentId).ifPresentOrElse(c -> {
                        dto.setContentExists(true);
                        dto.setContentTitle(c.getDecision() != null ? "Comment on: " + c.getDecision().getTitle() : "Decision Comment");
                        dto.setContentSnippet(c.getContent());
                        dto.setContentStatus(Boolean.TRUE.equals(c.getIsFlagged()) ? "FLAGGED / HIDDEN" : "ACTIVE");
                        dto.setContentUrl(c.getDecision() != null ? "/decisions/" + c.getDecision().getId() : null);
                        dto.setContentTemporarilyHidden(Boolean.TRUE.equals(c.getIsFlagged()));
                    }, () -> dto.setContentExists(false));
                    break;

                case "DISCUSSION":
                case "COMMUNITY_MESSAGE":
                    communityMessageRepository.findById(contentId).ifPresentOrElse(m -> {
                        dto.setContentExists(!Boolean.TRUE.equals(m.getIsDeleted()));
                        dto.setContentTitle(m.getChannel() != null ? "Message in #" + m.getChannel().getName() : "Community Message");
                        dto.setContentSnippet(m.getContent());
                        dto.setContentStatus(Boolean.TRUE.equals(m.getIsDeleted()) ? "DELETED" : "ACTIVE");
                        dto.setContentUrl(m.getChannel() != null && m.getChannel().getCommunity() != null ? "/communities/" + m.getChannel().getCommunity().getId() : "/communities");
                        dto.setContentTemporarilyHidden(Boolean.TRUE.equals(m.getIsEdited()));
                    }, () -> dto.setContentExists(false));
                    break;

                case "USER":
                    userRepository.findById(contentId).ifPresentOrElse(u -> {
                        dto.setContentExists(true);
                        dto.setContentTitle("User Account: " + (u.getFullName() != null ? u.getFullName() : u.getEmail()));
                        dto.setContentSnippet("Status: " + u.getAccountStatus() + ", Role: " + u.getRole());
                        dto.setContentStatus(u.getAccountStatus().name());
                    }, () -> dto.setContentExists(false));
                    break;

                default:
                    dto.setContentExists(false);
                    break;
            }
        } catch (Exception e) {
            dto.setContentExists(false);
        }
    }
}
