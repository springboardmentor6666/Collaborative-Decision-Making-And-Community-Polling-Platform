package com.decisionhub.controller;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CommunityRequest;
import com.decisionhub.dto.response.CommunityMemberResponse;
import com.decisionhub.dto.response.CommunityResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@Tag(name = "Community Management", description = "Endpoints for creating, joining, leaving communities and managing members")
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    @Operation(summary = "Create a new community")
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CommunityRequest request) {
        CommunityResponse response = communityService.createCommunity(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Community created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update community details")
    public ResponseEntity<ApiResponse<CommunityResponse>> updateCommunity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CommunityRequest request) {
        CommunityResponse response = communityService.updateCommunity(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Community updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get community details by ID")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunityById(@PathVariable Long id) {
        CommunityResponse response = communityService.getCommunityById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Search and filter communities")
    public ResponseEntity<ApiResponse<PagedResponse<CommunityResponse>>> searchCommunities(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommunityResponse> response = communityService.searchCommunities(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a community (Owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteCommunity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        communityService.deleteCommunity(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Community deleted successfully", null));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join a community")
    public ResponseEntity<ApiResponse<CommunityMemberResponse>> joinCommunity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CommunityMemberResponse response = communityService.joinCommunity(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Successfully joined community", response));
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "Leave a community")
    public ResponseEntity<ApiResponse<Void>> leaveCommunity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        communityService.leaveCommunity(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Successfully left community", null));
    }

    @PutMapping("/{id}/members/{userId}/role")
    @Operation(summary = "Promote or demote a community member (Owner only)")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestParam MemberRole role,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        communityService.updateMemberRole(id, userId, role, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Member role updated to " + role, null));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove a member from community")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        communityService.removeMember(id, userId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Member removed from community", null));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get roster of active community members")
    public ResponseEntity<ApiResponse<PagedResponse<CommunityMemberResponse>>> getMembers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommunityMemberResponse> response = communityService.getCommunityMembers(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
