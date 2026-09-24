package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.*;
import com.decisionhub.backend.entity.Activity;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.*;
import com.decisionhub.backend.service.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final CurrentUserService current;
    private final UserRepository users;
    private final DecisionRepository decisions;
    private final ActivityRepository activities;
    private final CommunityMembershipRepository memberships;
    private final VoteRepository votes;
    private final CommunityRepository communities;
    private final CommentRepository comments;
    private final ReportRepository reports;
    private final NotificationRepository notifications;
    private final CommunityMessageRepository communityMessages;
    private final PasswordEncoder passwordEncoder;

    public UserProfileServiceImpl(
            CurrentUserService current,
            UserRepository users,
            DecisionRepository decisions,
            ActivityRepository activities,
            CommunityMembershipRepository memberships,
            VoteRepository votes,
            CommunityRepository communities,
            CommentRepository comments,
            ReportRepository reports,
            NotificationRepository notifications,
            CommunityMessageRepository communityMessages,
            PasswordEncoder passwordEncoder
    ) {
        this.current = current;
        this.users = users;
        this.decisions = decisions;
        this.activities = activities;
        this.memberships = memberships;
        this.votes = votes;
        this.communities = communities;
        this.comments = comments;
        this.reports = reports;
        this.notifications = notifications;
        this.communityMessages = communityMessages;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse get() {
        return response(current.get());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActivity() {
        User user = current.get();

        List<Map<String, Object>> events = new java.util.ArrayList<>();
        activities.findByUserOrderByAtDesc(user).forEach(activity ->
                events.add(Map.of(
                        "type", activity.getType(),
                        "actor", user.getName(),
                        "subject", activity.getSubject(),
                        "at", activity.getAt()
                ))
        );
        memberships.findByUser(user).forEach(membership -> {

            events.add(Map.of(
                    "type", "Community joined",
                    "actor", user.getName(),
                    "subject", membership.getCommunity().getCommunityName(),
                    "at", membership.getJoinedAt()
            ));

            if (membership.getLeftAt() != null) {
                events.add(Map.of(
                        "type", "Community left",
                        "actor", user.getName(),
                        "subject", membership.getCommunity().getCommunityName(),
                        "at", membership.getLeftAt()
                ));
            }
        });

        decisions.findByCreatedBy(user).forEach(decision ->
                events.add(Map.of(
                        "type", "Decision created",
                        "actor", user.getName(),
                        "subject", decision.getTitle(),
                        "at", decision.getCreatedAt()
                ))
        );

        votes.findByUser(user).forEach(vote ->
                events.add(Map.of(
                        "type", "Vote submitted",
                        "actor", user.getName(),
                        "subject", vote.getDecision().getTitle(),
                        "at", vote.getCreatedAt()
                ))
        );

        comments.findByUser(user).forEach(comment ->
                events.add(Map.of(
                        "type", "Comment created",
                        "actor", user.getName(),
                        "subject", comment.getDecision().getTitle(),
                        "at", comment.getCreatedAt()
                ))
        );

        events.sort(java.util.Comparator.comparing(
                event -> (java.time.LocalDateTime) event.get("at"),
                java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())
        ));

        return events;
    }

    @Override
    public ProfileResponse update(ProfileUpdateRequest req) {
        User u = current.get();
        u.setName(req.getName().trim());
        return response(users.save(u));
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        User u = current.get();

        if (!passwordEncoder.matches(request.getCurrentPassword(), u.getPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), u.getPassword())) {
            throw new RuntimeException("New password must be different from your current password.");
        }

        u.setPassword(passwordEncoder.encode(request.getNewPassword()));
        users.save(u);
    }

    @Override
    @Transactional
    public void deleteAccount(DeleteAccountRequest request) {
        User u = current.get();

        if (!passwordEncoder.matches(request.getPassword(), u.getPassword())) {
            throw new RuntimeException("Incorrect password. Account deletion canceled.");
        }

        if (u.getRole() == Role.ADMIN && users.countByRole(Role.ADMIN) <= 1) {
            throw new IllegalStateException("Cannot delete the last remaining admin account.");
        }

        Long id = u.getId();

        // Delete communities owned by user
        communities.findByOwnerId(id).forEach(this::deleteCommunityAndDependencies);

        // Delete decisions created by user
        decisions.findByCreatedById(id).forEach(this::deleteDecisionAndDependencies);

        // Delete user comments, votes, reports, notifications, and community messages with targeted queries
        comments.deleteByUserId(id);
        votes.deleteByUserId(id);
        reports.deleteByReportedById(id);
        notifications.deleteByUserId(id);
        communityMessages.deleteByUserId(id);

        // Remove user from community memberships
        memberships.deleteByUserId(id);

        users.delete(u);
    }

    private void deleteDecisionAndDependencies(Decision decision) {
        Long decisionId = decision.getId();
        reports.deleteByDecisionId(decisionId);
        votes.deleteByDecisionId(decisionId);
        comments.deleteByDecisionId(decisionId);
        activities.save(
                Activity.builder()
                        .user(decision.getCreatedBy())
                        .type("Decision deleted")
                        .subject(decision.getTitle())
                        .at(java.time.LocalDateTime.now())
                        .build()
        );
        decisions.delete(decision);
    }

    private void deleteCommunityAndDependencies(Community community) {
        decisions.findByCommunityId(community.getId())
                .forEach(this::deleteDecisionAndDependencies);
        communityMessages.deleteByCommunityId(community.getId());
        memberships.deleteByCommunityId(community.getId());
        communities.delete(community);
    }

    private ProfileResponse response(User u) {
        return ProfileResponse.builder()
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .decisionsCreated(decisions.countByCreatedBy(u))
                .votesParticipated(votes.countByUser(u))
                .joinedCommunities(memberships.countActiveByUserId(u.getId()))
                .build();
    }
}
