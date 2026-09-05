package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.CommunityChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/communities/{communityId}/chat")
@Tag(name = "Community Chat", description = "Endpoints for community real-time channels, messages, reactions and pins")
public class CommunityChatController {

    private final CommunityChatService chatService;

    public CommunityChatController(CommunityChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/channels")
    @Operation(summary = "Get community channels", description = "Returns all chat channels for the specified community")
    public ResponseEntity<List<ChatChannelResponse>> getChannels(
            @PathVariable Long communityId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        List<ChatChannelResponse> channels = chatService.getChannels(communityId, userEmail);
        return ResponseEntity.ok(channels);
    }

    @PostMapping("/channels")
    @Operation(summary = "Create channel", description = "Creates a new chat channel in the community (OWNER/ADMIN only)")
    public ResponseEntity<ChatChannelResponse> createChannel(
            @PathVariable Long communityId,
            @Valid @RequestBody ChatChannelRequest request,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ChatChannelResponse channel = chatService.createChannel(communityId, request, userEmail);
        return new ResponseEntity<>(channel, HttpStatus.CREATED);
    }

    @GetMapping("/channels/{channelId}/messages")
    @Operation(summary = "Get channel messages", description = "Fetches paginated message history for a channel with optional cursor timestamp")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long communityId,
            @PathVariable Long channelId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime before,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100));
        List<ChatMessageResponse> messages = chatService.getMessages(communityId, channelId, before, pageable, userEmail);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/channels/{channelId}/messages")
    @Operation(summary = "Send message", description = "Sends a new message to the channel and broadcasts to WebSocket subscribers")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long communityId,
            @PathVariable Long channelId,
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ChatMessageResponse response = chatService.sendMessage(communityId, channelId, request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/messages/{messageId}")
    @Operation(summary = "Edit message", description = "Edits an existing message (Author only)")
    public ResponseEntity<ChatMessageResponse> editMessage(
            @PathVariable Long communityId,
            @PathVariable Long messageId,
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ChatMessageResponse response = chatService.editMessage(communityId, messageId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "Soft delete message", description = "Soft deletes a message (Author or community admin)")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long communityId,
            @PathVariable Long messageId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        chatService.deleteMessage(communityId, messageId, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/messages/{messageId}/react")
    @Operation(summary = "Toggle emoji reaction", description = "Adds or removes an emoji reaction to a message")
    public ResponseEntity<ChatMessageResponse> toggleReaction(
            @PathVariable Long communityId,
            @PathVariable Long messageId,
            @Valid @RequestBody ChatReactionRequest request,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ChatMessageResponse response = chatService.toggleReaction(communityId, messageId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/messages/{messageId}/pin")
    @Operation(summary = "Toggle pin message", description = "Pins or unpins a message in the channel (OWNER/ADMIN only)")
    public ResponseEntity<ChatMessageResponse> togglePin(
            @PathVariable Long communityId,
            @PathVariable Long messageId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ChatMessageResponse response = chatService.togglePinMessage(communityId, messageId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/channels/{channelId}/pinned")
    @Operation(summary = "Get pinned messages", description = "Retrieves all pinned messages for a channel")
    public ResponseEntity<List<ChatMessageResponse>> getPinnedMessages(
            @PathVariable Long communityId,
            @PathVariable Long channelId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        List<ChatMessageResponse> pinned = chatService.getPinnedMessages(communityId, channelId, userEmail);
        return ResponseEntity.ok(pinned);
    }
}
