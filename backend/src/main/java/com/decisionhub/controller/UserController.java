package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.UserRequest;

import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile Management", description = "Endpoints for user profile updates and saved decision bookmarks")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse response = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile details")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UserRequest request) {
        UserResponse response = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete current user account (Soft-delete)")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal UserPrincipal currentUser) {
        userService.deleteUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }


    @PostMapping("/me/saved/{decisionId}")
    @Operation(summary = "Bookmark / save a decision board")
    public ResponseEntity<ApiResponse<Void>> saveDecision(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long decisionId) {
        userService.saveDecision(currentUser.getId(), decisionId);
        return ResponseEntity.ok(ApiResponse.success("Decision saved.", null));
    }

    @DeleteMapping("/me/saved/{decisionId}")
    @Operation(summary = "Remove saved decision bookmark")
    public ResponseEntity<ApiResponse<Void>> unsaveDecision(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long decisionId) {
        userService.unsaveDecision(currentUser.getId(), decisionId);
        return ResponseEntity.ok(ApiResponse.success("Decision bookmark removed.", null));
    }

    @GetMapping("/me/saved")
    @Operation(summary = "Get user's bookmarked decisions")
    public ResponseEntity<ApiResponse<PagedResponse<DecisionResponse>>> getSavedDecisions(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<DecisionResponse> response = userService.getSavedDecisions(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
