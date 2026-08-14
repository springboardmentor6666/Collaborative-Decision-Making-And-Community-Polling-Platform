package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.CommunityService;
import com.decisionhub.service.DecisionService;
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
@RequestMapping("/api/communities")
@Tag(name = "Communities", description = "Endpoints for community group management and membership")
@SecurityRequirement(name = "bearerAuth")
public class CommunityController {

    private final CommunityService communityService;
    private final DecisionService decisionService;

    public CommunityController(CommunityService communityService, DecisionService decisionService) {
        this.communityService = communityService;
        this.decisionService = decisionService;
    }

    @PostMapping
    @Operation(summary = "Create a community group", description = "Creates a new community group with the authenticated user as OWNER")
    public ResponseEntity<CommunityResponse> createCommunity(@Valid @RequestBody CommunityRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CommunityResponse response = communityService.createCommunity(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all communities", description = "Retrieves public communities and private communities accessible to the user, with optional search filter")
    public ResponseEntity<List<CommunityResponse>> getAllCommunities(@RequestParam(required = false) String search, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        List<CommunityResponse> communities = communityService.getAllCommunities(search, email);
        return ResponseEntity.ok(communities);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get community by ID", description = "Retrieves community details including membership status and role")
    public ResponseEntity<CommunityResponse> getCommunityById(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CommunityResponse response = communityService.getCommunityById(id, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update community details", description = "Updates a community's name, description, category or visibility (OWNER/ADMIN only)")
    public ResponseEntity<CommunityResponse> updateCommunity(@PathVariable Long id, @Valid @RequestBody CommunityRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CommunityResponse response = communityService.updateCommunity(id, request, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete community", description = "Deletes a community group (OWNER only)")
    public ResponseEntity<Void> deleteCommunity(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        communityService.deleteCommunity(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join community", description = "Joins a public community group as a MEMBER")
    public ResponseEntity<CommunityResponse> joinCommunity(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CommunityResponse response = communityService.joinCommunity(id, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "Leave community", description = "Leaves a community group (prevented if sole owner with active members)")
    public ResponseEntity<Void> leaveCommunity(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        communityService.leaveCommunity(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get community members", description = "Retrieves all members of a community group")
    public ResponseEntity<List<CommunityMemberResponse>> getCommunityMembers(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        List<CommunityMemberResponse> members = communityService.getCommunityMembers(id, email);
        return ResponseEntity.ok(members);
    }

    @PatchMapping("/{id}/members/{userId}/role")
    @Operation(summary = "Update member role", description = "Promotes or demotes a member's role to ADMIN or MEMBER (OWNER only)")
    public ResponseEntity<CommunityMemberResponse> updateMemberRole(@PathVariable Long id,
                                                                    @PathVariable Long userId,
                                                                    @Valid @RequestBody UpdateMemberRoleRequest request,
                                                                    Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CommunityMemberResponse response = communityService.updateMemberRole(id, userId, request, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove member from community", description = "Removes a member from a community group (OWNER/ADMIN only)")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, @PathVariable Long userId, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        communityService.removeMember(id, userId, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/transfer-ownership")
    @Operation(summary = "Transfer community ownership", description = "Transfers group ownership to another member (OWNER only)")
    public ResponseEntity<CommunityResponse> transferOwnership(@PathVariable Long id,
                                                               @Valid @RequestBody TransferOwnershipRequest request,
                                                               Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CommunityResponse response = communityService.transferOwnership(id, request, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/decisions")
    @Operation(summary = "Get community decisions", description = "Retrieves all active decisions created within a community group")
    public ResponseEntity<List<DecisionResponse>> getCommunityDecisions(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        List<DecisionResponse> decisions = decisionService.getDecisionsByCommunityId(id, email);
        return ResponseEntity.ok(decisions);
    }

    @PostMapping("/{id}/decisions")
    @Operation(summary = "Create community decision", description = "Creates a new decision specifically linked to a community group (Members only)")
    public ResponseEntity<DecisionResponse> createCommunityDecision(@PathVariable Long id,
                                                                     @Valid @RequestBody DecisionRequest request,
                                                                     Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        request.setCommunityId(id);
        DecisionResponse response = decisionService.createDecision(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
