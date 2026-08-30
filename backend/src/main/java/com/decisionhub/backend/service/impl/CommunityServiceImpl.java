package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.CommunityMessageRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.service.CommunityService;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.DecisionService;
import com.decisionhub.backend.service.NotificationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository repository;
    private final CurrentUserService currentUser;
    private final DecisionRepository decisions;
    private final DecisionService decisionService;
    private final NotificationService notificationService;
    private final CommunityMessageRepository messages;
    private final UserRepository users;

    public CommunityServiceImpl(
            CommunityRepository repository,
            CurrentUserService currentUser,
            DecisionRepository decisions,
            DecisionService decisionService,
            NotificationService notificationService,
            CommunityMessageRepository messages,
            UserRepository users
    ) {
        this.repository = repository;
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
    public CommunityResponse createCommunity(
            CommunityRequest request
    ) {

        User user = currentUser.get();

        Community community = Community.builder()
                .communityName(
                        request.getCommunityName()
                )
                .description(
                        request.getDescription()
                )
                .owner(user)
                .build();

        community.getMembers().add(user);

        Community saved =
                repository.save(community);

        // Notify every admin that a new community has been created
        users.findByRole(Role.ADMIN)
                .forEach(admin -> notificationService.notifyUser(
                        admin,
                        "New community created: \"" + saved.getCommunityName()
                                + "\" by " + user.getName()
                ));

        return response(saved, user);
    }


    /* =========================
       GET ALL COMMUNITIES
    ========================= */

    @Override
    public List<CommunityResponse>
    getAllCommunities() {

        User user = currentUser.get();

        return repository.findAll()
                .stream()
                .map(
                        community ->
                                response(
                                        community,
                                        user
                                )
                )
                .collect(
                        Collectors.toList()
                );
    }


    /* =========================
       DELETE COMMUNITY
    ========================= */

    @Override
    @Transactional
    public void deleteCommunity(Long id) {

        Community community = find(id);

        User user = currentUser.get();


        // Only the owner can delete
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


        // Delete all community messages first
        messages.deleteAll(
                messages.findByCommunityIdOrderByCreatedAtAsc(id)
        );


        /*
         * The Community entity has:
         *
         * @OneToMany(
         *     mappedBy = "community",
         *     cascade = CascadeType.ALL,
         *     orphanRemoval = true
         * )
         *
         * Therefore, deleting the community
         * will also delete its decisions.
         */
        repository.delete(community);
    }


    /* =========================
       GET ONE COMMUNITY
    ========================= */

    @Override
    public CommunityResponse getCommunity(
            Long id
    ) {

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
    public CommunityResponse join(Long id) {

        User user = currentUser.get();

        Community community =
                find(id);

        community.getMembers()
                .add(user);

        Community saved =
                repository.save(community);


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
    public CommunityResponse leave(Long id) {

        User user =
                currentUser.get();

        Community community =
                find(id);


        // Owner cannot leave their own community
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


        community.getMembers()
                .removeIf(
                        member ->
                                member.getId()
                                        .equals(user.getId())
                );


        Community saved =
                repository.save(community);

        return response(
                saved,
                user
        );
    }


    /* =========================
       GET COMMUNITY DECISIONS
    ========================= */

    @Override
    public List<DecisionResponse>
    getCommunityDecisions(Long id) {

        Community community =
                find(id);

        User user =
                currentUser.get();


        // Only community members can view decisions
        boolean isMember =
                community.getMembers()
                        .stream()
                        .anyMatch(
                                member ->
                                        member.getId()
                                                .equals(
                                                        user.getId()
                                                )
                        );


        if (!isMember) {

            throw new AccessDeniedException(
                    "Join this community to view its decisions"
            );

        }


        return decisions
                .findByCommunityId(id)
                .stream()
                .map(
                        decisionService::toResponse
                )
                .collect(
                        Collectors.toList()
                );
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

                .memberCount(
                        community.getMembers()
                                .size()
                )

                .joined(
                        community.getMembers()
                                .stream()
                                .anyMatch(
                                        member ->
                                                member.getId()
                                                        .equals(
                                                                user.getId()
                                                        )
                                )
                )

                .owner(
                        community.getOwner() != null &&
                                community.getOwner()
                                        .getId()
                                        .equals(
                                                user.getId()
                                        )
                )

                .memberNames(
                        community.getMembers()
                                .stream()
                                .map(
                                        User::getName
                                )
                                .sorted()
                                .toList()
                )

                .build();
    }

}