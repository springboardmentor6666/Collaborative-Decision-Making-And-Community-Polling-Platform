package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.CommunityChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityChatControllerTest {

    @Mock
    private CommunityChatService chatService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CommunityChatController chatController;

    private ChatChannelResponse sampleChannel;
    private ChatMessageResponse sampleMessage;

    @BeforeEach
    void setUp() {
        sampleChannel = new ChatChannelResponse(1L, 10L, "general", "General chat", true,
                new UserSummaryDto(1L, "alice@example.com", "Alice", null), LocalDateTime.now());

        sampleMessage = new ChatMessageResponse(100L, 1L,
                new UserSummaryDto(1L, "alice@example.com", "Alice", null),
                "Test message", "TEXT", false, false, null, Map.of(), LocalDateTime.now());
    }

    @Test
    void testGetChannels() {
        when(authentication.getName()).thenReturn("alice@example.com");
        when(chatService.getChannels(10L, "alice@example.com")).thenReturn(List.of(sampleChannel));

        ResponseEntity<List<ChatChannelResponse>> response = chatController.getChannels(10L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("general", response.getBody().get(0).getName());
    }

    @Test
    void testCreateChannel() {
        when(authentication.getName()).thenReturn("alice@example.com");
        ChatChannelRequest request = new ChatChannelRequest("announcements", "Announcements only");
        when(chatService.createChannel(eq(10L), any(ChatChannelRequest.class), eq("alice@example.com")))
                .thenReturn(sampleChannel);

        ResponseEntity<ChatChannelResponse> response = chatController.createChannel(10L, request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(chatService, times(1)).createChannel(eq(10L), any(ChatChannelRequest.class), eq("alice@example.com"));
    }

    @Test
    void testGetMessages() {
        when(authentication.getName()).thenReturn("alice@example.com");
        when(chatService.getMessages(eq(10L), eq(1L), isNull(), any(Pageable.class), eq("alice@example.com")))
                .thenReturn(List.of(sampleMessage));

        ResponseEntity<List<ChatMessageResponse>> response = chatController.getMessages(10L, 1L, null, 0, 50, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Test message", response.getBody().get(0).getContent());
    }

    @Test
    void testSendMessage() {
        when(authentication.getName()).thenReturn("alice@example.com");
        ChatMessageRequest request = new ChatMessageRequest("Hello there");
        when(chatService.sendMessage(eq(10L), eq(1L), any(ChatMessageRequest.class), eq("alice@example.com")))
                .thenReturn(sampleMessage);

        ResponseEntity<ChatMessageResponse> response = chatController.sendMessage(10L, 1L, request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(chatService, times(1)).sendMessage(eq(10L), eq(1L), any(ChatMessageRequest.class), eq("alice@example.com"));
    }

    @Test
    void testEditMessage() {
        when(authentication.getName()).thenReturn("alice@example.com");
        ChatMessageRequest request = new ChatMessageRequest("Edited content");
        when(chatService.editMessage(eq(10L), eq(100L), any(ChatMessageRequest.class), eq("alice@example.com")))
                .thenReturn(sampleMessage);

        ResponseEntity<ChatMessageResponse> response = chatController.editMessage(10L, 100L, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(chatService, times(1)).editMessage(eq(10L), eq(100L), any(ChatMessageRequest.class), eq("alice@example.com"));
    }

    @Test
    void testDeleteMessage() {
        when(authentication.getName()).thenReturn("alice@example.com");
        doNothing().when(chatService).deleteMessage(10L, 100L, "alice@example.com");

        ResponseEntity<Void> response = chatController.deleteMessage(10L, 100L, authentication);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(chatService, times(1)).deleteMessage(10L, 100L, "alice@example.com");
    }

    @Test
    void testToggleReaction() {
        when(authentication.getName()).thenReturn("alice@example.com");
        ChatReactionRequest request = new ChatReactionRequest("❤️");
        when(chatService.toggleReaction(eq(10L), eq(100L), any(ChatReactionRequest.class), eq("alice@example.com")))
                .thenReturn(sampleMessage);

        ResponseEntity<ChatMessageResponse> response = chatController.toggleReaction(10L, 100L, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(chatService, times(1)).toggleReaction(eq(10L), eq(100L), any(ChatReactionRequest.class), eq("alice@example.com"));
    }

    @Test
    void testTogglePin() {
        when(authentication.getName()).thenReturn("alice@example.com");
        when(chatService.togglePinMessage(10L, 100L, "alice@example.com")).thenReturn(sampleMessage);

        ResponseEntity<ChatMessageResponse> response = chatController.togglePin(10L, 100L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(chatService, times(1)).togglePinMessage(10L, 100L, "alice@example.com");
    }

    @Test
    void testGetPinnedMessages() {
        when(authentication.getName()).thenReturn("alice@example.com");
        when(chatService.getPinnedMessages(10L, 1L, "alice@example.com")).thenReturn(List.of(sampleMessage));

        ResponseEntity<List<ChatMessageResponse>> response = chatController.getPinnedMessages(10L, 1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }
}
