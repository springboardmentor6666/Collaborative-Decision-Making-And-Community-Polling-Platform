package com.decisionhub;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.repository.*;
import com.decisionhub.service.CommunityChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CommunityChatIntegrationTest {

    @Autowired
    private CommunityChatService chatService;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommunityMemberRepository communityMemberRepository;

    @Autowired
    private CommunityChatChannelRepository channelRepository;

    @Autowired
    private CommunityMessageRepository messageRepository;

    @Autowired
    private CommunityMessageReactionRepository reactionRepository;

    @Autowired
    private UserRepository userRepository;

    private User owner;
    private User member;
    private User stranger;
    private Community publicComm;
    private Community privateComm;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setEmail("chat_owner@test.com");
        owner.setPasswordHash("pass123");
        owner.setFullName("Chat Owner");
        owner = userRepository.save(owner);

        member = new User();
        member.setEmail("chat_member@test.com");
        member.setPasswordHash("pass123");
        member.setFullName("Chat Member");
        member = userRepository.save(member);

        stranger = new User();
        stranger.setEmail("chat_stranger@test.com");
        stranger.setPasswordHash("pass123");
        stranger.setFullName("Chat Stranger");
        stranger = userRepository.save(stranger);

        publicComm = new Community();
        publicComm.setName("Public Chat Community");
        publicComm.setVisibility("PUBLIC");
        publicComm.setCreatedBy(owner);
        publicComm = communityRepository.save(publicComm);

        CommunityMember ownerMemberPub = new CommunityMember();
        ownerMemberPub.setCommunity(publicComm);
        ownerMemberPub.setUser(owner);
        ownerMemberPub.setRole("OWNER");
        communityMemberRepository.save(ownerMemberPub);

        privateComm = new Community();
        privateComm.setName("Private Chat Community");
        privateComm.setVisibility("PRIVATE");
        privateComm.setCreatedBy(owner);
        privateComm = communityRepository.save(privateComm);

        CommunityMember ownerMemberPriv = new CommunityMember();
        ownerMemberPriv.setCommunity(privateComm);
        ownerMemberPriv.setUser(owner);
        ownerMemberPriv.setRole("OWNER");
        communityMemberRepository.save(ownerMemberPriv);

        CommunityMember regularMemberPriv = new CommunityMember();
        regularMemberPriv.setCommunity(privateComm);
        regularMemberPriv.setUser(member);
        regularMemberPriv.setRole("MEMBER");
        communityMemberRepository.save(regularMemberPriv);
    }

    @Test
    void testChannelLifecycleAndLazyDefaultCreation() {
        // Initial get channels should create 'general' default channel
        List<ChatChannelResponse> channels = chatService.getChannels(publicComm.getId(), member.getEmail());
        assertEquals(1, channels.size());
        assertEquals("general", channels.get(0).getName());
        assertTrue(channels.get(0).getIsDefault());

        // Create new channel as OWNER
        ChatChannelRequest req = new ChatChannelRequest("tech-support", "Help desk channel");
        ChatChannelResponse newChannel = chatService.createChannel(publicComm.getId(), req, owner.getEmail());
        assertNotNull(newChannel.getId());
        assertEquals("tech-support", newChannel.getName());

        // Verify channel count
        List<ChatChannelResponse> updatedChannels = chatService.getChannels(publicComm.getId(), member.getEmail());
        assertEquals(2, updatedChannels.size());
    }

    @Test
    void testPrivateCommunityAccessControl() {
        // Member can access
        List<ChatChannelResponse> channels = chatService.getChannels(privateComm.getId(), member.getEmail());
        assertFalse(channels.isEmpty());

        // Stranger cannot access
        assertThrows(AccessDeniedException.class, () ->
                chatService.getChannels(privateComm.getId(), stranger.getEmail())
        );

        // Stranger cannot create channel
        ChatChannelRequest req = new ChatChannelRequest("hacker-chat", "Bad channel");
        assertThrows(AccessDeniedException.class, () ->
                chatService.createChannel(privateComm.getId(), req, stranger.getEmail())
        );
    }

    @Test
    void testMessageSendEditDeleteAndReactionFlow() {
        List<ChatChannelResponse> channels = chatService.getChannels(publicComm.getId(), owner.getEmail());
        Long channelId = channels.get(0).getId();

        // 1. Send Message
        ChatMessageRequest sendReq = new ChatMessageRequest("Hello Community!", "TEXT", null);
        ChatMessageResponse messageRes = chatService.sendMessage(publicComm.getId(), channelId, sendReq, member.getEmail());
        assertNotNull(messageRes.getId());
        assertEquals("Hello Community!", messageRes.getContent());

        // 2. Edit Message
        ChatMessageRequest editReq = new ChatMessageRequest("Hello Community (Edited)!");
        ChatMessageResponse editedRes = chatService.editMessage(publicComm.getId(), messageRes.getId(), editReq, member.getEmail());
        assertEquals("Hello Community (Edited)!", editedRes.getContent());
        assertTrue(editedRes.getIsEdited());

        // 3. Reaction Toggle
        ChatReactionRequest reactReq = new ChatReactionRequest("🔥");
        ChatMessageResponse reactedRes = chatService.toggleReaction(publicComm.getId(), messageRes.getId(), reactReq, owner.getEmail());
        assertTrue(reactedRes.getReactions().containsKey("🔥"));
        assertEquals(1, reactedRes.getReactions().get("🔥").size());

        // Toggle again to remove reaction
        ChatMessageResponse unreactedRes = chatService.toggleReaction(publicComm.getId(), messageRes.getId(), reactReq, owner.getEmail());
        assertFalse(unreactedRes.getReactions().containsKey("🔥"));

        // 4. Pin Message
        ChatMessageResponse pinnedRes = chatService.togglePinMessage(publicComm.getId(), messageRes.getId(), owner.getEmail());
        assertTrue(pinnedRes.getIsPinned());

        List<ChatMessageResponse> pinnedList = chatService.getPinnedMessages(publicComm.getId(), channelId, member.getEmail());
        assertEquals(1, pinnedList.size());

        // 5. Soft Delete Message
        chatService.deleteMessage(publicComm.getId(), messageRes.getId(), member.getEmail());
        List<ChatMessageResponse> messagesAfterDelete = chatService.getMessages(publicComm.getId(), channelId, null, PageRequest.of(0, 10), member.getEmail());
        assertEquals(0, messagesAfterDelete.size());
    }
}
