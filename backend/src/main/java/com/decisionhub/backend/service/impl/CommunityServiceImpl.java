package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.CommunityMemberShip;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.CommunityMessageRepository;
import com.decisionhub.backend.repository.CommunityMembershipRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.service.CommunityService;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.DecisionService;
import com.decisionhub.backend.service.NotificationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository repository;
    private final CommunityMembershipRepository membershipRepository;
    private final CurrentUserService currentUser;
    private final DecisionRepository decisions;
    private final DecisionService decisionService;
    private final NotificationService notificationService;
    private final CommunityMessageRepository messages;
    private final UserRepository users;

    public CommunityServiceImpl(
            CommunityRepository repository,
            CommunityMembershipRepository membershipRepository,
            CurrentUserService currentUser,
            DecisionRepository decisions,
            DecisionService decisionService,
            NotificationService notificationService,
            CommunityMessageRepository messages,
            UserRepository users
    ) {
        this.repository = repository;
        this.membershipRepository = membershipRepository;
        this.currentUser = currentUser;
        this.decisions = decisions;
        this.decisionService = decisionService;
        this.notificationService = notificationService;
        this.messages = messages;
        this.users = users;
    }

    /* =========================
       CREATE COMMUNITY
    ========================= */

    @Override
    @Transactional
    public CommunityResponse createCommunity(
            CommunityRequest request
    ) {

        User user = currentUser.get();

        Community community = Community.builder()
                .communityName(request.getCommunityName())
                .description(request.getDescription())
                .owner(user)
                .build();

        Community saved = repository.save(community);

        /*
         * The creator automatically becomes
         * a member of the community.
         */
        CommunityMemberShip membership = CommunityMemberShip.builder()
                .community(saved)
                .user(user)
                .build();

        membershipRepository.save(membership);

        /*
         * Keep the relationship synchronized.
         */
        saved.getMembers().add(membership);

        /*
         * Notify every admin.
         */
        users.findByRole(Role.ADMIN)
                .forEach(admin ->
                        notificationService.notifyUser(
                                admin,
                                "New community created: \""
                                        + saved.getCommunityName()
                                        + "\" by "
                                        + user.getName()
                        )
                );

        return response(saved, user);
    }


    /* =========================
       GET ALL COMMUNITIES
    ========================= */

    @Override
    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities() {

        User user = currentUser.get();

        return repository.findAll()
                .stream()
                .map(community -> response(community, user))
                .collect(Collectors.toList());
    }


    /* =========================
       DELETE COMMUNITY
    ========================= */

    @Override
    @Transactional
    public void deleteCommunity(Long id) {

        Community community = find(id);

        User user = currentUser.get();

        /*
         * Only owner can delete.
         */
        if (
                community.getOwner() == null ||
                        !community.getOwner()
                                .getId()
                                .equals(user.getId())
        ) {

            throw new AccessDeniedException(
                    "Only the community owner can delete it"
            );
        }

        /*
         * Delete all community messages first using targeted delete.
         */
        messages.deleteByCommunityId(id);

        /*
         * Community has cascade = ALL and orphanRemoval = true
         * for memberships and decisions.
         */
        repository.delete(community);
    }


    /* =========================
       GET ONE COMMUNITY
    ========================= */

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunity(Long id) {

        User user = currentUser.get();

        return response(
                find(id),
                user
        );
    }


    /* =========================
       JOIN COMMUNITY
    ========================= */

    @Override
    @Transactional
    public CommunityResponse join(Long id) {

        User user = currentUser.get();

        Community community = find(id);

        /*
         * Check whether user already has
         * an active membership.
         */
        boolean alreadyMember = community.getMembers()
                .stream()
                .anyMatch(member ->
                        member.getUser() != null &&
                                member.getUser()
                                        .getId()
                                        .equals(user.getId()) &&
                                member.getLeftAt() == null
                );

        if (alreadyMember) {
            return response(community, user);
        }

        /*
         * Create membership.
         */
        CommunityMemberShip membership =
                CommunityMemberShip.builder()
                        .community(community)
                        .user(user)
                        .build();

        membershipRepository.save(membership);

        community.getMembers().add(membership);

        Community saved = repository.save(community);

        /*
         * Notify owner.
         */
        if (
                community.getOwner() != null &&
                        !community.getOwner()
                                .getId()
                                .equals(user.getId())
        ) {

            notificationService.notifyUser(
                    community.getOwner(),
                    user.getName()
                            + " joined your community \""
                            + community.getCommunityName()
                            + "\""
            );
        }

        return response(
                saved,
                user
        );
    }


    /* =========================
       LEAVE COMMUNITY
    ========================= */

    @Override
    @Transactional
    public CommunityResponse leave(Long id) {

        User user = currentUser.get();

        Community community = find(id);

        /*
         * Owner cannot leave.
         */
        if (
                community.getOwner() != null &&
                        community.getOwner()
                                .getId()
                                .equals(user.getId())
        ) {

            throw new IllegalStateException(
                    "The owner cannot leave their community"
            );
        }

        /*
         * Find active membership.
         */
        CommunityMemberShip membership =
                community.getMembers()
                        .stream()
                        .filter(member ->
                                member.getUser() != null &&
                                        member.getUser()
                                                .getId()
                                                .equals(user.getId()) &&
                                        member.getLeftAt() == null
                        )
                        .findFirst()
                        .orElse(null);

        if (membership != null) {

            /*
             * Mark membership as left.
             */
            membership.setLeftAt(
                    LocalDateTime.now()
            );

            membershipRepository.save(membership);

            /*
             * Remove from active collection.
             */
            community.getMembers().remove(membership);
        }

        Community saved = repository.save(community);

        return response(
                saved,
                user
        );
    }


    /* =========================
       GET COMMUNITY DECISIONS
    ========================= */

    @Override
    @Transactional(readOnly = true)
    public List<DecisionResponse> getCommunityDecisions(Long id) {

        Community community = find(id);

        User user = currentUser.get();

        /*
         * Check active membership.
         */
        boolean isMember = community.getMembers()
                .stream()
                .anyMatch(member ->
                        member.getUser() != null &&
                                member.getUser()
                                        .getId()
                                        .equals(user.getId()) &&
                                member.getLeftAt() == null
                );

        /*
         * Owner is also allowed.
         */
        boolean isOwner =
                community.getOwner() != null &&
                        community.getOwner()
                                .getId()
                                .equals(user.getId());

        if (!isMember && !isOwner) {

            throw new AccessDeniedException(
                    "Join this community to view its decisions"
            );
        }

        return decisions
                .findByCommunityId(id)
                .stream()
                .map(decisionService::toResponse)
                .collect(Collectors.toList());
    }


    /* =========================
       FIND COMMUNITY
    ========================= */

    private Community find(Long id) {

        return repository
                .findById(id)
                .orElseThrow(
                        () ->
                                new java.util.NoSuchElementException(
                                        "Community not found"
                                )
                );
    }


    /* =========================
       COMMUNITY RESPONSE
    ========================= */

    private CommunityResponse response(
            Community community,
            User user
    ) {

        return CommunityResponse.builder()

                .id(
                        community.getId()
                )

                .communityName(
                        community.getCommunityName()
                )

                .description(
                        community.getDescription()
                )

                .ownerName(
                        community.getOwner() == null
                                ? "Unknown"
                                : community.getOwner()
                                .getName()
                )

                .createdAt(
                        community.getCreatedAt()
                )

                /*
                 * Count only active members.
                 */
                .memberCount(
                        (int) community.getMembers()
                                .stream()
                                .filter(member ->
                                        member.getLeftAt() == null
                                )
                                .count()
                )

                /*
                 * Check whether current user is
                 * an active member.
                 */
                .joined(
                        community.getMembers()
                                .stream()
                                .anyMatch(
                                        member ->
                                                member.getUser() != null &&
                                                        member.getUser()
                                                                .getId()
                                                                .equals(user.getId()) &&
                                                        member.getLeftAt() == null
                                )
                )

                /*
                 * Check whether current user
                 * owns the community.
                 */
                .owner(
                        community.getOwner() != null &&
                                community.getOwner()
                                        .getId()
                                        .equals(user.getId())
                )

                /*
                 * Get names of active members.
                 */
                .memberNames(
                        community.getMembers()
                                .stream()
                                .filter(member ->
                                        member.getLeftAt() == null
                                )
                                .map(
                                        CommunityMemberShip::getUser
                                )
                                .filter(
                                        memberUser ->
                                                memberUser != null
                                )
                                .map(
                                        User::getName
                                )
                                .sorted()
                                .toList()
                )

                .build();
    }

}