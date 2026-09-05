package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.ChannelNotFoundException;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.exception.MessageNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommunityChatService {

    private final CommunityChatChannelRepository channelRepository;
    private final CommunityMessageRepository messageRepository;
    private final CommunityMessageReactionRepository reactionRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public CommunityChatService(CommunityChatChannelRepository channelRepository,
                                CommunityMessageRepository messageRepository,
                                CommunityMessageReactionRepository reactionRepository,
                                CommunityRepository communityRepository,
                                CommunityMemberRepository communityMemberRepository,
                                UserRepository userRepository,
                                SimpMessagingTemplate messagingTemplate) {
        this.channelRepository = channelRepository;
        this.messageRepository = messageRepository;
        this.reactionRepository = reactionRepository;
        this.communityRepository = communityRepository;
        this.communityMemberRepository = communityMemberRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public List<ChatChannelResponse> getChannels(Long communityId, String userEmail) {
        Community community = findCommunityById(communityId);
        User user = findUserByEmailOrNull(userEmail);
        validateCommunityAccess(community, user);

        List<CommunityChatChannel> channels = channelRepository.findByCommunityId(communityId);
        if (channels.isEmpty()) {
            // Lazily ensure a default channel exists
            CommunityChatChannel defaultChannel = new CommunityChatChannel();
            defaultChannel.setCommunity(community);
            defaultChannel.setName("general");
            defaultChannel.setDescription("General discussion channel");
            defaultChannel.setIsDefault(true);
            defaultChannel.setCreatedBy(community.getCreatedBy());
            defaultChannel = channelRepository.save(defaultChannel);
            channels = List.of(defaultChannel);
        }

        return channels.stream()
                .map(this::mapToChannelResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatChannelResponse createChannel(Long communityId, ChatChannelRequest request, String userEmail) {
        Community community = findCommunityById(communityId);
        User user = findUserByEmail(userEmail);
        validateOwnerOrAdmin(community, user);

        String normalizedName = request.getName().trim().toLowerCase();
        if (channelRepository.existsByCommunityIdAndName(communityId, normalizedName)) {
            throw new IllegalArgumentException("Channel with name '" + normalizedName + "' already exists in this community");
        }

        CommunityChatChannel channel = new CommunityChatChannel();
        channel.setCommunity(community);
        channel.setName(normalizedName);
        channel.setDescription(request.getDescription());
        channel.setIsDefault(false);
        channel.setCreatedBy(user);

        CommunityChatChannel savedChannel = channelRepository.save(channel);
        return mapToChannelResponse(savedChannel);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long communityId, Long channelId, LocalDateTime before,
                                                 Pageable pageable, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityChatChannel channel = findChannelById(channelId);
        validateChannelBelongsToCommunity(channel, communityId);

        User user = findUserByEmailOrNull(userEmail);
        validateCommunityAccess(community, user);

        List<CommunityMessage> messages;
        if (before != null) {
            messages = messageRepository.findByChannelIdAndCreatedAtBeforeAndIsDeletedFalseOrderByCreatedAtDesc(channelId, before, pageable);
        } else {
            messages = messageRepository.findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(channelId, pageable);
        }

        return messages.stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long communityId, Long channelId, ChatMessageRequest request, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityChatChannel channel = findChannelById(channelId);
        validateChannelBelongsToCommunity(channel, communityId);

        User sender = findUserByEmail(userEmail);
        validateCommunityAccess(community, sender);

        CommunityMessage parentMessage = null;
        if (request.getParentMessageId() != null) {
            parentMessage = messageRepository.findById(request.getParentMessageId())
                    .orElseThrow(() -> new MessageNotFoundException("Parent message not found with id: " + request.getParentMessageId()));
            validateChannelBelongsToCommunity(parentMessage.getChannel(), communityId);
            if (!parentMessage.getChannel().getId().equals(channelId)) {
                throw new IllegalArgumentException("Parent message does not belong to the target channel");
            }
        }

        CommunityMessage message = new CommunityMessage();
        message.setChannel(channel);
        message.setSender(sender);
        message.setParentMessage(parentMessage);
        message.setContent(request.getContent().trim());
        message.setMessageType(request.getMessageType() != null && !request.getMessageType().isBlank() ? request.getMessageType() : "TEXT");
        message.setIsPinned(false);
        message.setIsEdited(false);
        message.setIsDeleted(false);

        CommunityMessage savedMessage = messageRepository.save(message);
        ChatMessageResponse response = mapToMessageResponse(savedMessage);

        // Broadcast to WebSocket subscribers of this channel
        messagingTemplate.convertAndSend("/topic/channels/" + channelId, response);

        return response;
    }

    @Transactional
    public ChatMessageResponse sendMessageByChannelId(Long channelId, ChatMessageRequest request, String userEmail) {
        CommunityChatChannel channel = findChannelById(channelId);
        return sendMessage(channel.getCommunity().getId(), channelId, request, userEmail);
    }

    @Transactional
    public ChatMessageResponse editMessage(Long communityId, Long messageId, ChatMessageRequest request, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityMessage message = findMessageById(messageId);
        validateChannelBelongsToCommunity(message.getChannel(), communityId);

        User user = findUserByEmail(userEmail);

        if (!message.getSender().getId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Only the message author can edit this message");
        }

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new IllegalStateException("Cannot edit a deleted message");
        }

        message.setContent(request.getContent().trim());
        message.setIsEdited(true);
        message.setUpdatedAt(LocalDateTime.now());

        CommunityMessage updated = messageRepository.save(message);
        ChatMessageResponse response = mapToMessageResponse(updated);

        messagingTemplate.convertAndSend("/topic/channels/" + message.getChannel().getId(), response);

        return response;
    }

    @Transactional
    public void deleteMessage(Long communityId, Long messageId, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityMessage message = findMessageById(messageId);
        validateChannelBelongsToCommunity(message.getChannel(), communityId);

        User user = findUserByEmail(userEmail);

        boolean isAuthor = message.getSender().getId().equals(user.getId());
        boolean isPlatformAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        boolean isCommunityOwnerOrAdmin = false;

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(communityId, user.getId()).orElse(null);
        if (member != null && ("OWNER".equalsIgnoreCase(member.getRole()) || "ADMIN".equalsIgnoreCase(member.getRole()))) {
            isCommunityOwnerOrAdmin = true;
        }

        if (!isAuthor && !isPlatformAdmin && !isCommunityOwnerOrAdmin) {
            throw new AccessDeniedException("Only the message author or community admins can delete this message");
        }

        message.setIsDeleted(true);
        message.setContent("[Message deleted]");
        message.setUpdatedAt(LocalDateTime.now());

        CommunityMessage saved = messageRepository.save(message);
        ChatMessageResponse response = mapToMessageResponse(saved);

        messagingTemplate.convertAndSend("/topic/channels/" + message.getChannel().getId(), response);
    }

    @Transactional
    public ChatMessageResponse toggleReaction(Long communityId, Long messageId, ChatReactionRequest request, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityMessage message = findMessageById(messageId);
        validateChannelBelongsToCommunity(message.getChannel(), communityId);

        User user = findUserByEmail(userEmail);
        validateCommunityAccess(community, user);

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new IllegalStateException("Cannot react to a deleted message");
        }

        String emoji = request.getEmoji().trim();
        var existingReaction = reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, user.getId(), emoji);

        if (existingReaction.isPresent()) {
            reactionRepository.delete(existingReaction.get());
        } else {
            CommunityMessageReaction reaction = new CommunityMessageReaction(message, user, emoji);
            reactionRepository.save(reaction);
        }

        // Flush and fetch updated message response
        ChatMessageResponse response = mapToMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/channels/" + message.getChannel().getId(), response);

        return response;
    }

    @Transactional
    public ChatMessageResponse togglePinMessage(Long communityId, Long messageId, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityMessage message = findMessageById(messageId);
        validateChannelBelongsToCommunity(message.getChannel(), communityId);

        User user = findUserByEmail(userEmail);
        validateOwnerOrAdmin(community, user);

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new IllegalStateException("Cannot pin a deleted message");
        }

        message.setIsPinned(!Boolean.TRUE.equals(message.getIsPinned()));
        message.setUpdatedAt(LocalDateTime.now());

        CommunityMessage updated = messageRepository.save(message);
        ChatMessageResponse response = mapToMessageResponse(updated);

        messagingTemplate.convertAndSend("/topic/channels/" + message.getChannel().getId(), response);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getPinnedMessages(Long communityId, Long channelId, String userEmail) {
        Community community = findCommunityById(communityId);
        CommunityChatChannel channel = findChannelById(channelId);
        validateChannelBelongsToCommunity(channel, communityId);

        User user = findUserByEmailOrNull(userEmail);
        validateCommunityAccess(community, user);

        List<CommunityMessage> pinnedMessages = messageRepository.findByChannelIdAndIsPinnedTrueAndIsDeletedFalse(channelId);
        return pinnedMessages.stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public void handleTyping(Long channelId, TypingIndicatorDto typingDto, String userEmail) {
        CommunityChatChannel channel = findChannelById(channelId);
        Community community = channel.getCommunity();

        User user = findUserByEmail(userEmail);
        validateCommunityAccess(community, user);

        String displayName = user.getFullName() != null && !user.getFullName().isBlank()
                ? user.getFullName()
                : user.getEmail();

        TypingIndicatorDto enrichedDto = new TypingIndicatorDto(
                user.getId(),
                displayName,
                Boolean.TRUE.equals(typingDto.getIsTyping())
        );

        messagingTemplate.convertAndSend("/topic/channels/" + channelId + "/typing", enrichedDto);
    }

    // --- Helper Validation & Mapping Methods ---

    private Community findCommunityById(Long communityId) {
        return communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));
    }

    private CommunityChatChannel findChannelById(Long channelId) {
        return channelRepository.findById(channelId)
                .orElseThrow(() -> new ChannelNotFoundException("Channel not found with id: " + channelId));
    }

    private CommunityMessage findMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException("Message not found with id: " + messageId));
    }

    private User findUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    private User findUserByEmailOrNull(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private void validateChannelBelongsToCommunity(CommunityChatChannel channel, Long communityId) {
        if (!channel.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Channel does not belong to the specified community");
        }
    }

    private void validateCommunityAccess(Community community, User user) {
        if ("PRIVATE".equalsIgnoreCase(community.getVisibility())) {
            if (user == null) {
                throw new AccessDeniedException("Access denied to private community chat");
            }
            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return;
            }
            boolean isMember = communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), user.getId());
            if (!isMember) {
                throw new AccessDeniedException("Access denied to private community chat");
            }
        }
    }

    private void validateOwnerOrAdmin(Community community, User user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required");
        }
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return;
        }
        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), user.getId())
                .orElseThrow(() -> new AccessDeniedException("Only community owners and admins can perform this action"));
        if (!"OWNER".equalsIgnoreCase(member.getRole()) && !"ADMIN".equalsIgnoreCase(member.getRole())) {
            throw new AccessDeniedException("Only community owners and admins can perform this action");
        }
    }

    private ChatChannelResponse mapToChannelResponse(CommunityChatChannel channel) {
        UserSummaryDto creatorDto = channel.getCreatedBy() != null
                ? mapToUserSummaryDto(channel.getCreatedBy())
                : null;
        return new ChatChannelResponse(
                channel.getId(),
                channel.getCommunity().getId(),
                channel.getName(),
                channel.getDescription(),
                channel.getIsDefault(),
                creatorDto,
                channel.getCreatedAt()
        );
    }

    private ChatMessageResponse mapToMessageResponse(CommunityMessage message) {
        Map<String, List<String>> reactionMap = new LinkedHashMap<>();
        List<CommunityMessageReaction> reactions = reactionRepository.findByMessageId(message.getId());
        for (CommunityMessageReaction reaction : reactions) {
            String userName = reaction.getUser().getFullName() != null && !reaction.getUser().getFullName().isBlank()
                    ? reaction.getUser().getFullName()
                    : reaction.getUser().getEmail();
            reactionMap.computeIfAbsent(reaction.getEmoji(), k -> new ArrayList<>()).add(userName);
        }

        ChatMessageResponse response = new ChatMessageResponse(
                message.getId(),
                message.getChannel().getId(),
                mapToUserSummaryDto(message.getSender()),
                message.getContent(),
                message.getMessageType(),
                message.getIsPinned(),
                message.getIsEdited(),
                message.getParentMessage() != null ? message.getParentMessage().getId() : null,
                reactionMap,
                message.getCreatedAt()
        );
        response.setIsDeleted(message.getIsDeleted());
        response.setUpdatedAt(message.getUpdatedAt());
        return response;
    }

    private UserSummaryDto mapToUserSummaryDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfileImage()
        );
    }
}
