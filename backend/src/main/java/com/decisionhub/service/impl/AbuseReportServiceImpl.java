package com.decisionhub.service.impl;

import com.decisionhub.common.enums.AbuseReportStatus;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.dto.request.AbuseReportRequest;
import com.decisionhub.dto.response.AbuseReportResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.AbuseReport;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.repository.AbuseReportRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.AbuseReportService;
import com.decisionhub.service.DecisionService;
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
    private final UserRepository userRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final DecisionService decisionService;

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
            reports = abuseReportRepository.findByDecision_Community_CommunityIdAndStatus(communityId, status, pageable);
        } else {
            reports = abuseReportRepository.findByDecision_Community_CommunityId(communityId, pageable);
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
    public AbuseReportResponse resolveReport(Long reportId, boolean deleteDecision, Long userId) {
        AbuseReport report = abuseReportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("AbuseReport", "id", reportId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        // Check rights: Must be system admin or community owner/moderator
        boolean hasRights = false;
        if (RoleType.ROLE_ADMIN.equals(user.getRole().getRoleName())) {
            hasRights = true;
        } else {
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

        if (deleteDecision) {
            // Check if decision exists before deleting
            Decision decision = report.getDecision();
            decisionService.deleteDecision(decision.getDecisionId(), userId);
        }

        report.setStatus(deleteDecision ? AbuseReportStatus.RESOLVED : AbuseReportStatus.DISMISSED);
        report.setResolvedBy(user);
        
        AbuseReport savedReport = abuseReportRepository.save(report);
        return mapToResponse(savedReport);
    }

    private AbuseReportResponse mapToResponse(AbuseReport report) {
        UserResponse reportedBy = mapUserToResponse(report.getReportedBy());
        UserResponse resolvedBy = report.getResolvedBy() != null ? mapUserToResponse(report.getResolvedBy()) : null;
        
        Long communityId = report.getDecision().getCommunity() != null ? report.getDecision().getCommunity().getCommunityId() : null;
        String communityName = report.getDecision().getCommunity() != null ? report.getDecision().getCommunity().getName() : null;

        return AbuseReportResponse.builder()
                .reportId(report.getReportId())
                .decisionId(report.getDecision().getDecisionId())
                .decisionTitle(report.getDecision().getTitle())
                .communityId(communityId)
                .communityName(communityName)
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
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profileImage(user.getProfileImage())
                .role(user.getRole().getRoleName())
                .accountStatus(user.getAccountStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
