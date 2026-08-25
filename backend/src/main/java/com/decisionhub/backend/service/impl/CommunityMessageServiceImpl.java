package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.CommunityMessageRequest;
import com.decisionhub.backend.dto.CommunityMessageResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.CommunityMessage;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.CommunityMessageRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.service.CommunityMessageService;
import com.decisionhub.backend.service.CurrentUserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityMessageServiceImpl implements CommunityMessageService {
    private final CommunityMessageRepository messages;
    private final CommunityRepository communities;
    private final CurrentUserService currentUser;

    public CommunityMessageServiceImpl(CommunityMessageRepository messages, CommunityRepository communities, CurrentUserService currentUser) {
        this.messages = messages;
        this.communities = communities;
        this.currentUser = currentUser;
    }

    @Override
    public List<CommunityMessageResponse> list(Long communityId) {
        User user = requireMember(communityId);
        return messages.findByCommunityIdOrderByCreatedAtAsc(communityId).stream()
                .map(message -> response(message, user))
                .toList();
    }

    @Override
    public CommunityMessageResponse add(Long communityId, CommunityMessageRequest request) {
        User user = requireMember(communityId);
        Community community = findCommunity(communityId);
        CommunityMessage saved = messages.save(CommunityMessage.builder()
                .content(request.getContent().trim())
                .community(community)
                .user(user)
                .build());
        return response(saved, user);
    }

    @Override
    public void delete(Long messageId) {
        User user = currentUser.get();
        CommunityMessage message = messages.findById(messageId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Message not found"));
        if (!message.getUser().getId().equals(user.getId()) && !message.getCommunity().getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only the author or community owner can delete this message");
        }
        messages.delete(message);
    }

    private User requireMember(Long communityId) {
        User user = currentUser.get();
        Community community = findCommunity(communityId);
        if (community.getMembers().stream().noneMatch(member -> member.getId().equals(user.getId()))) {
            throw new AccessDeniedException("Join this community to participate");
        }
        return user;
    }

    private Community findCommunity(Long id) {
        return communities.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Community not found"));
    }

    private CommunityMessageResponse response(CommunityMessage message, User user) {
        return CommunityMessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .userId(message.getUser().getId())
                .userName(message.getUser().getName())
                .createdAt(message.getCreatedAt())
                .canDelete(message.getUser().getId().equals(user.getId()) || message.getCommunity().getOwner().getId().equals(user.getId()))
                .build();
    }
}
