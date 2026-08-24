package com.decisionhub.controller;

import com.decisionhub.dto.ModerationFlagRequest;
import com.decisionhub.dto.ModerationFlagResponse;
import com.decisionhub.service.ModerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@Tag(name = "Moderation", description = "Endpoints for content moderation and flagging")
@SecurityRequirement(name = "bearerAuth")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping("/flag")
    @Operation(summary = "Flag content", description = "Flags a comment or decision for moderation review")
    public ResponseEntity<ModerationFlagResponse> flagContent(@Valid @RequestBody ModerationFlagRequest request, Authentication authentication) {
        ModerationFlagResponse response = moderationService.flagContent(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/flags")
    @Operation(summary = "Get all pending flags", description = "Retrieves all pending moderation flags (Moderator/Admin only)")
    public ResponseEntity<List<ModerationFlagResponse>> getAllPendingFlags(Authentication authentication) {
        return ResponseEntity.ok(moderationService.getAllPendingFlags(authentication.getName()));
    }

    @GetMapping("/flags/{id}")
    @Operation(summary = "Get flag details", description = "Retrieves specific moderation flag details (Moderator/Admin only)")
    public ResponseEntity<ModerationFlagResponse> getFlagById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(moderationService.getFlagById(id, authentication.getName()));
    }

    @PutMapping("/flags/{id}/resolve")
    @Operation(summary = "Resolve a flag", description = "Marks a moderation flag as resolved (Moderator/Admin only)")
    public ResponseEntity<ModerationFlagResponse> resolveFlag(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(moderationService.resolveFlag(id, authentication.getName()));
    }

    @GetMapping("/flags/target/{type}/{id}")
    @Operation(summary = "Get flags by target", description = "Retrieves all moderation flags for a specific target comment/decision (Moderator/Admin only)")
    public ResponseEntity<List<ModerationFlagResponse>> getFlagsByTarget(@PathVariable String type, @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(moderationService.getFlagsByTarget(type, id, authentication.getName()));
    }
}
