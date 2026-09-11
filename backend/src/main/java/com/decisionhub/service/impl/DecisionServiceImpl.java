package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.AttachmentResponse;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.HikeResponse;

import com.decisionhub.entity.Attachment;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.DecisionHike;
import com.decisionhub.entity.DecisionView;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.exception.ValidationException;
import com.decisionhub.mapper.AttachmentMapper;
import com.decisionhub.mapper.DecisionMapper;

import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.UserPreference;
import com.decisionhub.repository.AttachmentRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.DecisionHikeRepository;
import com.decisionhub.repository.DecisionViewRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.UserPreferenceRepository;
import com.decisionhub.service.AuditLogService;
import com.decisionhub.service.DecisionService;
import com.decisionhub.service.NotificationService;
import com.decisionhub.specification.DecisionSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class DecisionServiceImpl implements DecisionService {

    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final VoteRepository voteRepository;
    private final com.decisionhub.repository.CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final DecisionHikeRepository decisionHikeRepository;
    private final DecisionViewRepository decisionViewRepository;
    private final DecisionMapper decisionMapper;
    private final AttachmentMapper attachmentMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserPreferenceRepository userPreferenceRepository;

    @Override
    @Transactional
    public DecisionResponse createDecision(Long userId, DecisionRequest request) {
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new ValidationException("At least two comparison options are required to publish a decision board.");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        Community community = null;
        if (request.getCommunityId() != null) {
            community = communityRepository.findById(request.getCommunityId())
                    .orElseThrow(() -> new EntityNotFoundException("Community", "id", request.getCommunityId()));
            
            boolean isMember = communityMemberRepository.existsByCommunityCommunityIdAndUserUserIdAndStatus(
                    request.getCommunityId(), userId, com.decisionhub.common.enums.MemberStatus.ACTIVE);
            
            if (!isMember) {
                throw new ForbiddenException("You must be an active member of this community to post in it.");
            }
        }

        Decision decision = decisionMapper.toEntity(request);
        decision.setCreatedBy(author);
        decision.setCommunity(community);
        decision.setStatus(DecisionStatus.ACTIVE);
        if (community != null && community.getVisibility() == com.decisionhub.common.enums.CommunityVisibility.PRIVATE) {
            decision.setVisibility(DecisionVisibility.PRIVATE);
        } else if (decision.getVisibility() == null) {
            decision.setVisibility(DecisionVisibility.PUBLIC);
        }

        // Map options
        if (request.getOptions() != null) {
            for (var optReq : request.getOptions()) {
                Option option = Option.builder()
                        .title(optReq.getTitle())
                        .description(optReq.getDescription())
                        .totalScore(BigDecimal.ZERO)
                        .build();

                decision.addOption(option);
            }
        }

        Decision savedDecision = decisionRepository.save(decision);

        // Link attachments if provided
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<Attachment> attachments = attachmentRepository.findAllById(request.getAttachmentIds());
            for (Attachment att : attachments) {
                att.setDecision(savedDecision);
            }
            attachmentRepository.saveAll(attachments);
        }

        auditLogService.logAction(userId, "DECISION_CREATED", "DECISION", savedDecision.getDecisionId(), "Created decision board: \"" + savedDecision.getTitle() + "\"");

        // Notify joined community members
        if (community != null) {
            try {
                List<CommunityMember> members = communityMemberRepository.findByCommunityCommunityIdAndStatus(
                        community.getCommunityId(), MemberStatus.ACTIVE);
                String notifTitle = "New Decision in " + community.getName();
                String notifMsg = author.getFullName() + " posted a new decision: \"" + savedDecision.getTitle() + "\"";

                for (CommunityMember member : members) {
                    if (member.getUser() != null && !member.getUser().getUserId().equals(userId)) {
                        Long memberUserId = member.getUser().getUserId();
                        boolean shouldNotify = userPreferenceRepository.findByUserUserId(memberUserId)
                                .map(UserPreference::isNotifyNewDecisions)
                                .orElse(true);
                        if (shouldNotify) {
                            try {
                                notificationService.sendNotification(
                                        memberUserId,
                                        notifTitle,
                                        notifMsg,
                                        NotificationType.COMMUNITY_DECISION
                                );
                            } catch (Exception e) {
                                log.error("Failed to send decision notification to user ID {}: {}", memberUserId, e.getMessage());
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to process community decision notifications for community ID {}: {}", community.getCommunityId(), e.getMessage());
            }
        }

        return enrichDecisionResponse(savedDecision);
    }

    @Override
    @Transactional
    public DecisionResponse updateDecision(Long decisionId, Long userId, DecisionRequest request) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        if (!decision.getCreatedBy().getUserId().equals(userId)) {
            throw new ForbiddenException("Only the decision author can modify this board.");
        }

        if (request.getTitle() != null) decision.setTitle(request.getTitle());
        if (request.getDescription() != null) decision.setDescription(request.getDescription());
        if (request.getDeadline() != null) decision.setDeadline(request.getDeadline());
        if (request.getVisibility() != null) decision.setVisibility(request.getVisibility());
        if (request.getAllowAnonymousVote() != null) decision.setAllowAnonymousVote(request.getAllowAnonymousVote());

        // Handle attachment re-links
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<Attachment> attachments = attachmentRepository.findAllById(request.getAttachmentIds());
            for (Attachment att : attachments) {
                att.setDecision(decision);
            }
            attachmentRepository.saveAll(attachments);
        }

        Decision saved = decisionRepository.save(decision);
        auditLogService.logAction(userId, "DECISION_UPDATED", "DECISION", decisionId, "Updated decision board: \"" + saved.getTitle() + "\"");

        return enrichDecisionResponse(saved);
    }

    @Override
    @Transactional
    public DecisionResponse getDecisionById(Long decisionId, Long requestingUserId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        if (decision.getVisibility() == DecisionVisibility.PRIVATE || 
            (decision.getCommunity() != null && decision.getCommunity().getVisibility() == com.decisionhub.common.enums.CommunityVisibility.PRIVATE)) {
            
            if (requestingUserId == null) {
                throw new ForbiddenException("You must be logged in to view this private decision.");
            }
            
            boolean isAuthor = decision.getCreatedBy().getUserId().equals(requestingUserId);
            boolean isMember = false;
            if (decision.getCommunity() != null) {
                isMember = communityMemberRepository.existsByCommunityCommunityIdAndUserUserIdAndStatus(
                        decision.getCommunity().getCommunityId(), requestingUserId, com.decisionhub.common.enums.MemberStatus.ACTIVE);
            }
            
            if (!isAuthor && !isMember) {
                throw new ForbiddenException("This decision is private and you do not have access.");
            }
        }

        // Only increment view count if user hasn't viewed before (unique view per user)
        int updatedViewCount = decision.getViewCount();
        if (requestingUserId != null) {
            boolean alreadyViewed = decisionViewRepository.existsByUserUserIdAndDecisionDecisionId(requestingUserId, decisionId);
            if (!alreadyViewed) {
                try {
                    User userRef = userRepository.getReferenceById(requestingUserId);
                    DecisionView view = DecisionView.builder()
                            .decision(decision)
                            .user(userRef)
                            .build();
                    decisionViewRepository.save(view);
                    decisionRepository.incrementViewCount(decisionId);
                } catch (Exception e) {
                    log.debug("View already recorded concurrently for user {} on decision {}", requestingUserId, decisionId);
                }
                updatedViewCount = decision.getViewCount() + 1;
            }
        }

        DecisionResponse response = enrichDecisionResponse(decision, requestingUserId);
        response.setViewCount(updatedViewCount);
        return response;
    }

    @Override
    @Transactional
    public void deleteDecision(Long decisionId, Long userId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));
        
        com.decisionhub.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        boolean isAdmin = user.getRole().getRoleName() == com.decisionhub.common.enums.RoleType.ROLE_ADMIN;

        boolean isAuthor = decision.getCreatedBy() != null && decision.getCreatedBy().getUserId().equals(userId);
        boolean isCommunityOwnerOrMod = false;
        if (decision.getCommunity() != null) {
            isCommunityOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(
                    decision.getCommunity().getCommunityId(), userId)
                    .map(m -> m.getMemberRole() == com.decisionhub.common.enums.MemberRole.OWNER || m.getMemberRole() == com.decisionhub.common.enums.MemberRole.MODERATOR)
                    .orElse(false);
        }

        if (!isAuthor && !isAdmin && !isCommunityOwnerOrMod) {
            throw new ForbiddenException("Only the decision author, community moderator/owner, or an admin can delete this board.");
        }
        String decisionTitle = decision.getTitle();
        decisionRepository.delete(decision);
        auditLogService.logAction(userId, "DECISION_DELETED", "DECISION", decisionId, "Deleted decision board: \"" + decisionTitle + "\"");
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> searchDecisions(
            String searchQuery, Long communityId,
            DecisionVisibility visibility, DecisionStatus status, VoteType voteType,
            Long createdById, Long requestingUserId, Pageable pageable) {

        Page<DecisionResponse> page = decisionRepository.findAll(
                DecisionSpecification.filterDecisions(searchQuery, communityId, visibility, status, voteType, createdById, requestingUserId),
                pageable
        ).map(d -> enrichDecisionResponse(d, requestingUserId));

        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getTrendingDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findTrendingDecisions(requestingUserId, pageable)
                .map(d -> enrichDecisionResponse(d, requestingUserId));
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getPopularDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findPopularDecisions(requestingUserId, pageable)
                .map(d -> enrichDecisionResponse(d, requestingUserId));
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getLatestDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findLatestDecisions(requestingUserId, pageable)
                .map(d -> enrichDecisionResponse(d, requestingUserId));
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getMostHikedDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findMostHikedDecisions(requestingUserId, pageable)
                .map(d -> enrichDecisionResponse(d, requestingUserId));
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional
    public HikeResponse toggleHike(Long decisionId, Long userId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        boolean alreadyHiked = decisionHikeRepository.existsByUserUserIdAndDecisionDecisionId(userId, decisionId);

        if (alreadyHiked) {
            decisionHikeRepository.deleteByUserUserIdAndDecisionDecisionId(userId, decisionId);
            decisionHikeRepository.flush();
            decisionRepository.decrementLikeCount(decisionId);
            auditLogService.logAction(userId, "DECISION_UNHIKED", "DECISION", decisionId, "Unhiked decision: \"" + decision.getTitle() + "\"");

            int actualCount = (int) decisionHikeRepository.countByDecisionDecisionId(decisionId);
            return HikeResponse.builder()
                    .decisionId(decisionId)
                    .isHiked(false)
                    .hikeCount(actualCount)
                    .build();
        } else {
            // Delete any stale record first to prevent duplicate key constraint failure
            decisionHikeRepository.deleteByUserUserIdAndDecisionDecisionId(userId, decisionId);
            decisionHikeRepository.flush();

            DecisionHike hike = DecisionHike.builder()
                    .decision(decision)
                    .user(user)
                    .build();
            decisionHikeRepository.saveAndFlush(hike);
            decisionRepository.incrementLikeCount(decisionId);
            auditLogService.logAction(userId, "DECISION_HIKED", "DECISION", decisionId, "Hiked decision: \"" + decision.getTitle() + "\"");

            // Dispatch notification to decision author if hiked by another user and author wants hike notifications
            if (decision.getCreatedBy() != null && !decision.getCreatedBy().getUserId().equals(userId)) {
                Long authorId = decision.getCreatedBy().getUserId();
                boolean wantsHikeNotifications = userPreferenceRepository.findByUserUserId(authorId)
                        .map(UserPreference::isNotifyHikes)
                        .orElse(true);

                if (wantsHikeNotifications) {
                    try {
                        String hikerName = (user.getFullName() != null && !user.getFullName().isBlank())
                                ? user.getFullName()
                                : user.getUsername();
                        String decisionTitle = decision.getTitle();
                        String title = "New Hike on " + decisionTitle;
                        if (title.length() > 140) {
                            title = title.substring(0, 137) + "...";
                        }
                        String message = hikerName + " hiked your decision.";
                        notificationService.sendNotification(authorId, title, message, NotificationType.HIKE);
                    } catch (Exception e) {
                        log.error("Failed to send hike notification to user {}: {}", authorId, e.getMessage());
                    }
                }
            }

            int actualCount = (int) decisionHikeRepository.countByDecisionDecisionId(decisionId);
            return HikeResponse.builder()
                    .decisionId(decisionId)
                    .isHiked(true)
                    .hikeCount(actualCount)
                    .build();
        }
    }

    private DecisionResponse enrichDecisionResponse(Decision decision) {
        return enrichDecisionResponse(decision, null);
    }

    private DecisionResponse enrichDecisionResponse(Decision decision, Long requestingUserId) {
        DecisionResponse response = decisionMapper.toResponse(decision);
        long totalVotes = voteRepository.countByDecisionDecisionId(decision.getDecisionId());
        response.setTotalVotes(totalVotes);

        long commentCount = commentRepository.countByDecisionDecisionId(decision.getDecisionId());
        response.setCommentCount(commentCount);

        long actualHikes = decisionHikeRepository.countByDecisionDecisionId(decision.getDecisionId());
        response.setLikeCount((int) actualHikes);
        response.setHikeCount((int) actualHikes);

        if (response.getOptions() != null) {
            for (var optRes : response.getOptions()) {
                long optVotes = voteRepository.countByOptionOptionId(optRes.getOptionId());
                optRes.setVoteCount(optVotes);
            }
        }

        // Populate attachments
        List<Attachment> attachments = attachmentRepository.findByDecisionDecisionId(decision.getDecisionId());
        if (attachments != null && !attachments.isEmpty()) {
            List<AttachmentResponse> attachmentResponses = attachments.stream()
                    .map(attachmentMapper::toResponse)
                    .toList();
            response.setAttachments(attachmentResponses);
        }

        if (requestingUserId != null) {
            boolean isHiked = decisionHikeRepository.existsByUserUserIdAndDecisionDecisionId(requestingUserId, decision.getDecisionId());
            response.setHiked(isHiked);
        } else {
            response.setHiked(false);
        }

        return response;
    }
}
