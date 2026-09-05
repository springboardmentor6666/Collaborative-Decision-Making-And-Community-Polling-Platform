package com.decisionhub.controller;

import com.decisionhub.dto.ChatMessageRequest;
import com.decisionhub.dto.TypingIndicatorDto;
import com.decisionhub.service.CommunityChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Principal;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityChatWsControllerTest {

    @Mock
    private CommunityChatService chatService;

    @Mock
    private Principal principal;

    @InjectMocks
    private CommunityChatWsController wsController;

    @Test
    void testHandleSendMessageAuthenticated() {
        when(principal.getName()).thenReturn("bob@example.com");
        ChatMessageRequest request = new ChatMessageRequest("Hello WebSocket");

        wsController.handleSendMessage(10L, request, principal);

        verify(chatService, times(1)).sendMessageByChannelId(10L, request, "bob@example.com");
    }

    @Test
    void testHandleSendMessageUnauthenticated() {
        ChatMessageRequest request = new ChatMessageRequest("Hello WebSocket");

        wsController.handleSendMessage(10L, request, null);

        verifyNoInteractions(chatService);
    }

    @Test
    void testHandleTypingIndicatorAuthenticated() {
        when(principal.getName()).thenReturn("bob@example.com");
        TypingIndicatorDto dto = new TypingIndicatorDto(true);

        wsController.handleTypingIndicator(10L, dto, principal);

        verify(chatService, times(1)).handleTyping(10L, dto, "bob@example.com");
    }

    @Test
    void testHandleTypingIndicatorUnauthenticated() {
        TypingIndicatorDto dto = new TypingIndicatorDto(true);

        wsController.handleTypingIndicator(10L, dto, null);

        verifyNoInteractions(chatService);
    }
}
