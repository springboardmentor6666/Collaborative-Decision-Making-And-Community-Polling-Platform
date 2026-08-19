package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.service.NotificationService;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.service.CommunityService;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.DecisionService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository repository;
    private final CurrentUserService currentUser;
    private final DecisionRepository decisions;
    private final DecisionService decisionService;
    private final NotificationService notificationService;

    public CommunityServiceImpl(CommunityRepository repository, CurrentUserService currentUser, DecisionRepository decisions, DecisionService decisionService, NotificationService notificationService) {
        this.repository = repository;
        this.currentUser = currentUser;
        this.decisions = decisions;
        this.decisionService = decisionService;
        this.notificationService = notificationService;
    }

    @Override
    public CommunityResponse createCommunity(CommunityRequest request) {

        User user = currentUser.get();
        Community community = Community.builder()
                .communityName(request.getCommunityName())
                .description(request.getDescription())
                .owner(user)
                .build();
        community.getMembers().add(user);

        Community saved = repository.save(community);

        return response(saved, user);
    }

    @Override
    public List<CommunityResponse> getAllCommunities() {

        User user = currentUser.get();
        return repository.findAll().stream().map(c -> response(c, user))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCommunity(Long id) {

        Community community = find(id);
        if (community.getOwner() == null || !community.getOwner().getId().equals(currentUser.get().getId())) throw new AccessDeniedException("Only the community owner can delete it");
        repository.delete(community);

    }

    @Override public CommunityResponse getCommunity(Long id) { User user = currentUser.get(); return response(find(id), user); }
    @Override public CommunityResponse join(Long id) {
        User user = currentUser.get();
        Community community = find(id);
        community.getMembers().add(user);
        Community saved = repository.save(community);
        if (community.getOwner() != null && !community.getOwner().getId().equals(user.getId())) {
            notificationService.notifyUser(community.getOwner(), user.getName() + " joined your community \"" + community.getCommunityName() + "\"");
        }
        return response(saved, user);
    }
    @Override public CommunityResponse leave(Long id) {
        User user = currentUser.get(); Community community = find(id);
        if (community.getOwner() != null && community.getOwner().getId().equals(user.getId())) throw new IllegalStateException("The owner cannot leave their community");
        community.getMembers().removeIf(member -> member.getId().equals(user.getId()));
        return response(repository.save(community), user);
    }
    @Override public List<DecisionResponse> getCommunityDecisions(Long id) {
        Community community = find(id); User user = currentUser.get();
        if (community.getMembers().stream().noneMatch(m -> m.getId().equals(user.getId()))) throw new AccessDeniedException("Join this community to view its decisions");
        return decisions.findByCommunityId(id).stream().map(decisionService::toResponse).collect(Collectors.toList());
    }
    private Community find(Long id) { return repository.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Community not found")); }
    private CommunityResponse response(Community c, User user) { return CommunityResponse.builder().id(c.getId()).communityName(c.getCommunityName()).description(c.getDescription()).ownerName(c.getOwner() == null ? "Unknown" : c.getOwner().getName()).createdAt(c.getCreatedAt()).memberCount(c.getMembers().size()).joined(c.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()))).memberNames(c.getMembers().stream().map(User::getName).sorted().toList()).build(); }
}
