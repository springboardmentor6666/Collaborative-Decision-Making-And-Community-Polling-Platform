package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.ChannelNotFoundException;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.exception.MessageNotFoundException;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityChatServiceTest {

    @Mock
    private CommunityChatChannelRepository channelRepository;

    @Mock
    private CommunityMessageRepository messageRepository;

    @Mock
    private CommunityMessageReactionRepository reactionRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private CommunityChatService chatService;

    private Community publicCommunity;
    private Community privateCommunity;
    private User ownerUser;
    private User regularUser;
    private User otherUser;
    private CommunityChatChannel defaultChannel;
    private CommunityMessage sampleMessage;

    @BeforeEach
    void setUp() {
        ownerUser = new User();
        ownerUser.setId(1L);
        ownerUser.setEmail("owner@example.com");
        ownerUser.setFullName("Community Owner");
        ownerUser.setRole("USER");

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setEmail("member@example.com");
        regularUser.setFullName("Regular Member");
        regularUser.setRole("USER");

        otherUser = new User();
        otherUser.setId(3L);
        otherUser.setEmail("stranger@example.com");
        otherUser.setFullName("Stranger");
        otherUser.setRole("USER");

        publicCommunity = new Community();
        publicCommunity.setId(10L);
        publicCommunity.setName("Tech Public");
        publicCommunity.setVisibility("PUBLIC");
        publicCommunity.setCreatedBy(ownerUser);

        privateCommunity = new Community();
        privateCommunity.setId(20L);
        privateCommunity.setName("Secret Private");
        privateCommunity.setVisibility("PRIVATE");
        privateCommunity.setCreatedBy(ownerUser);

        defaultChannel = new CommunityChatChannel();
        defaultChannel.setId(100L);
        defaultChannel.setCommunity(publicCommunity);
        defaultChannel.setName("general");
        defaultChannel.setIsDefault(true);
        defaultChannel.setCreatedBy(ownerUser);

        sampleMessage = new CommunityMessage();
        sampleMessage.setId(1000L);
        sampleMessage.setChannel(defaultChannel);
        sampleMessage.setSender(regularUser);
        sampleMessage.setContent("Hello World");
        sampleMessage.setMessageType("TEXT");
        sampleMessage.setIsPinned(false);
        sampleMessage.setIsEdited(false);
        sampleMessage.setIsDeleted(false);
        sampleMessage.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetChannelsPublicCommunity() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(channelRepository.findByCommunityId(10L)).thenReturn(List.of(defaultChannel));

        List<ChatChannelResponse> result = chatService.getChannels(10L, "member@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("general", result.get(0).getName());
        assertTrue(result.get(0).getIsDefault());
    }

    @Test
    void testGetChannelsPrivateCommunityNonMemberAccessDenied() {
        when(communityRepository.findById(20L)).thenReturn(Optional.of(privateCommunity));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(otherUser));
        when(communityMemberRepository.existsByCommunityIdAndUserId(20L, 3L)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () ->
                chatService.getChannels(20L, "stranger@example.com")
        );
    }

    @Test
    void testGetChannelsPrivateCommunityMemberSuccess() {
        when(communityRepository.findById(20L)).thenReturn(Optional.of(privateCommunity));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));
        when(communityMemberRepository.existsByCommunityIdAndUserId(20L, 2L)).thenReturn(true);
        when(channelRepository.findByCommunityId(20L)).thenReturn(List.of(defaultChannel));

        List<ChatChannelResponse> result = chatService.getChannels(20L, "member@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testCreateChannelAsOwnerSuccess() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerUser));

        CommunityMember ownerMember = new CommunityMember();
        ownerMember.setRole("OWNER");
        when(communityMemberRepository.findByCommunityIdAndUserId(10L, 1L)).thenReturn(Optional.of(ownerMember));

        ChatChannelRequest request = new ChatChannelRequest("dev-talk", "Dev channel");
        when(channelRepository.existsByCommunityIdAndName(10L, "dev-talk")).thenReturn(false);

        CommunityChatChannel createdChannel = new CommunityChatChannel();
        createdChannel.setId(101L);
        createdChannel.setCommunity(publicCommunity);
        createdChannel.setName("dev-talk");
        createdChannel.setDescription("Dev channel");
        createdChannel.setCreatedBy(ownerUser);
        when(channelRepository.save(any(CommunityChatChannel.class))).thenReturn(createdChannel);

        ChatChannelResponse response = chatService.createChannel(10L, request, "owner@example.com");

        assertNotNull(response);
        assertEquals("dev-talk", response.getName());
        verify(channelRepository, times(1)).save(any(CommunityChatChannel.class));
    }

    @Test
    void testCreateChannelAsMemberThrowsAccessDenied() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));

        CommunityMember member = new CommunityMember();
        member.setRole("MEMBER");
        when(communityMemberRepository.findByCommunityIdAndUserId(10L, 2L)).thenReturn(Optional.of(member));

        ChatChannelRequest request = new ChatChannelRequest("dev-talk", "Dev channel");

        assertThrows(AccessDeniedException.class, () ->
                chatService.createChannel(10L, request, "member@example.com")
        );
    }

    @Test
    void testSendMessageSuccessAndBroadcasts() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(channelRepository.findById(100L)).thenReturn(Optional.of(defaultChannel));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));
        when(messageRepository.save(any(CommunityMessage.class))).thenReturn(sampleMessage);
        when(reactionRepository.findByMessageId(sampleMessage.getId())).thenReturn(List.of());

        ChatMessageRequest request = new ChatMessageRequest("Hello World", "TEXT", null);
        ChatMessageResponse response = chatService.sendMessage(10L, 100L, request, "member@example.com");

        assertNotNull(response);
        assertEquals("Hello World", response.getContent());
        assertEquals("Regular Member", response.getSender().getFullName());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/channels/100"), any(ChatMessageResponse.class));
    }

    @Test
    void testGetMessagesPagination() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(channelRepository.findById(100L)).thenReturn(Optional.of(defaultChannel));
        Pageable pageable = PageRequest.of(0, 10);
        when(messageRepository.findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(100L, pageable))
                .thenReturn(List.of(sampleMessage));
        when(reactionRepository.findByMessageId(sampleMessage.getId())).thenReturn(List.of());

        List<ChatMessageResponse> result = chatService.getMessages(10L, 100L, null, pageable, "member@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Hello World", result.get(0).getContent());
    }

    @Test
    void testEditMessageByAuthorSuccess() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(messageRepository.findById(1000L)).thenReturn(Optional.of(sampleMessage));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));
        when(messageRepository.save(any(CommunityMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reactionRepository.findByMessageId(1000L)).thenReturn(List.of());

        ChatMessageRequest editRequest = new ChatMessageRequest("Updated content");
        ChatMessageResponse response = chatService.editMessage(10L, 1000L, editRequest, "member@example.com");

        assertNotNull(response);
        assertEquals("Updated content", response.getContent());
        assertTrue(response.getIsEdited());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/channels/100"), any(ChatMessageResponse.class));
    }

    @Test
    void testEditMessageByNonAuthorThrowsAccessDenied() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(messageRepository.findById(1000L)).thenReturn(Optional.of(sampleMessage));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(otherUser));

        ChatMessageRequest editRequest = new ChatMessageRequest("Malicious update");

        assertThrows(AccessDeniedException.class, () ->
                chatService.editMessage(10L, 1000L, editRequest, "stranger@example.com")
        );
    }

    @Test
    void testDeleteMessageByAuthorSoftDeletes() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(messageRepository.findById(1000L)).thenReturn(Optional.of(sampleMessage));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));
        when(messageRepository.save(any(CommunityMessage.class))).thenAnswer(inv -> inv.getArgument(0));

        chatService.deleteMessage(10L, 1000L, "member@example.com");

        assertTrue(sampleMessage.getIsDeleted());
        assertEquals("[Message deleted]", sampleMessage.getContent());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/channels/100"), any(ChatMessageResponse.class));
    }

    @Test
    void testToggleReactionAddAndRemove() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(messageRepository.findById(1000L)).thenReturn(Optional.of(sampleMessage));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));

        // First toggle: Add reaction
        when(reactionRepository.findByMessageIdAndUserIdAndEmoji(1000L, 2L, "👍"))
                .thenReturn(Optional.empty());
        when(reactionRepository.save(any(CommunityMessageReaction.class))).thenAnswer(inv -> inv.getArgument(0));

        CommunityMessageReaction sampleReaction = new CommunityMessageReaction(sampleMessage, regularUser, "👍");
        when(reactionRepository.findByMessageId(1000L)).thenReturn(List.of(sampleReaction));

        ChatReactionRequest req = new ChatReactionRequest("👍");
        ChatMessageResponse res1 = chatService.toggleReaction(10L, 1000L, req, "member@example.com");

        assertNotNull(res1);
        assertTrue(res1.getReactions().containsKey("👍"));
        assertEquals(1, res1.getReactions().get("👍").size());
        assertEquals("Regular Member", res1.getReactions().get("👍").get(0));

        // Second toggle: Remove reaction
        when(reactionRepository.findByMessageIdAndUserIdAndEmoji(1000L, 2L, "👍"))
                .thenReturn(Optional.of(sampleReaction));
        when(reactionRepository.findByMessageId(1000L)).thenReturn(List.of());

        ChatMessageResponse res2 = chatService.toggleReaction(10L, 1000L, req, "member@example.com");
        assertNotNull(res2);
        assertFalse(res2.getReactions().containsKey("👍"));
        verify(reactionRepository, times(1)).delete(sampleReaction);
    }

    @Test
    void testTogglePinMessageAsOwnerSuccess() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));
        when(messageRepository.findById(1000L)).thenReturn(Optional.of(sampleMessage));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerUser));

        CommunityMember ownerMember = new CommunityMember();
        ownerMember.setRole("OWNER");
        when(communityMemberRepository.findByCommunityIdAndUserId(10L, 1L)).thenReturn(Optional.of(ownerMember));
        when(messageRepository.save(any(CommunityMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reactionRepository.findByMessageId(1000L)).thenReturn(List.of());

        ChatMessageResponse response = chatService.togglePinMessage(10L, 1000L, "owner@example.com");

        assertNotNull(response);
        assertTrue(response.getIsPinned());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/channels/100"), any(ChatMessageResponse.class));
    }

    @Test
    void testHandleTypingBroadcastsEnrichedEvent() {
        when(channelRepository.findById(100L)).thenReturn(Optional.of(defaultChannel));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(regularUser));

        TypingIndicatorDto input = new TypingIndicatorDto(true);
        chatService.handleTyping(100L, input, "member@example.com");

        verify(messagingTemplate, times(1)).convertAndSend(
                eq("/topic/channels/100/typing"),
                any(TypingIndicatorDto.class)
        );
    }
}
