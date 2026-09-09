package com.decisionhub.controller;

import com.decisionhub.dto.ChatMessageRequest;
import com.decisionhub.dto.ChatMessageResponse;
import com.decisionhub.dto.TypingIndicatorDto;
import com.decisionhub.service.CommunityChatService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityChatWsController
 * Architecture Tier: REST API Controller (Presentation Tier)
 * Package: com.decisionhub.controller
 *
 * Purpose:
 *   Handles real-time WebSocket STOMP messaging for community chat: broadcasting messages, handling reactions, typing indicators, and read receipt updates.
 */
@Controller
public class CommunityChatWsController {

    private static final Logger log = LoggerFactory.getLogger(CommunityChatWsController.class);

    private final CommunityChatService chatService;

    public CommunityChatWsController(CommunityChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.send/{channelId}")
    public void handleSendMessage(
            @DestinationVariable Long channelId,
            @Valid @Payload ChatMessageRequest request,
            Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated WebSocket message rejected for channel: {}", channelId);
            return;
        }

        String userEmail = principal.getName();
        log.debug("Received WebSocket message for channel {} from user {}", channelId, userEmail);
        chatService.sendMessageByChannelId(channelId, request, userEmail);
    }

    @MessageMapping("/chat.typing/{channelId}")
    public void handleTypingIndicator(
            @DestinationVariable Long channelId,
            @Payload TypingIndicatorDto typingDto,
            Principal principal) {
        if (principal == null) {
            return;
        }

        String userEmail = principal.getName();
        chatService.handleTyping(channelId, typingDto, userEmail);
    }
}
