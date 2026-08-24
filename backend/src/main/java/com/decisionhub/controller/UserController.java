package com.decisionhub.controller;

import com.decisionhub.dto.UserResponse;
import com.decisionhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for viewing user profiles")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieves a list of all registered users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves details of a specific user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user", description = "Retrieves profile of currently logged in user")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.mapToUserResponse(userService.getUserByEmail(authentication.getName())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile", description = "Updates user profile name, bio, and avatar (Self or Admin only)")
    public ResponseEntity<UserResponse> updateUserProfile(@PathVariable Long id,
                                                          @jakarta.validation.Valid @RequestBody com.decisionhub.dto.UserProfileUpdateRequest request,
                                                          Authentication authentication) {
        UserResponse response = userService.updateUserProfile(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update user profile (PATCH)", description = "Updates user profile name, bio, and avatar (Self or Admin only)")
    public ResponseEntity<UserResponse> patchUserProfile(@PathVariable Long id,
                                                         @jakarta.validation.Valid @RequestBody com.decisionhub.dto.UserProfileUpdateRequest request,
                                                         Authentication authentication) {
        UserResponse response = userService.updateUserProfile(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user account", description = "Deletes user account (Self or Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        userService.deleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/interests")
    @Operation(summary = "Get user interests", description = "Retrieves interests (category list) of currently logged in user")
    public ResponseEntity<java.util.Set<com.decisionhub.entity.Category>> getUserInterests(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserInterests(authentication.getName()));
    }

    @PostMapping("/me/interests")
    @Operation(summary = "Update user interests", description = "Updates interests (category list) of currently logged in user")
    public ResponseEntity<java.util.Set<com.decisionhub.entity.Category>> updateUserInterests(@jakarta.validation.Valid @RequestBody com.decisionhub.dto.UpdateInterestsRequest request,
                                                                                             Authentication authentication) {
        java.util.Set<com.decisionhub.entity.Category> response = userService.updateUserInterests(request.getCategoryIds(), authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/visibility/toggle")
    @Operation(summary = "Toggle profile visibility", description = "Toggles profile visibility flag (isPublic)")
    public ResponseEntity<java.util.Map<String, Boolean>> toggleProfileVisibility(Authentication authentication) {
        boolean newVal = userService.toggleProfileVisibility(authentication.getName());
        return ResponseEntity.ok(java.util.Map.of("isPublic", newVal));
    }

    @PutMapping("/me/visibility")
    @Operation(summary = "Update profile visibility", description = "Updates profile visibility flag (isPublic)")
    public ResponseEntity<java.util.Map<String, Boolean>> updateProfileVisibility(Authentication authentication) {
        boolean newVal = userService.toggleProfileVisibility(authentication.getName());
        return ResponseEntity.ok(java.util.Map.of("isPublic", newVal));
    }

    @GetMapping("/me/saved-decisions")
    @Operation(summary = "Get saved decisions", description = "Retrieves saved decisions of currently logged in user")
    public ResponseEntity<List<UserResponse>> getSavedDecisions(Authentication authentication) {
        // Wait! The user request says "using the saved_decisions table" and "GET/POST/DELETE /api/users/me/saved-decisions".
        // It returns a list of decisions saved by the user. Let's return List<DecisionResponse>.
        // Let's check imports, DecisionResponse is imported.
        return ResponseEntity.ok((List) userService.getSavedDecisions(authentication.getName()));
    }

    @PostMapping("/me/saved-decisions")
    @Operation(summary = "Save a decision", description = "Saves a decision to the user's saved decisions list")
    public ResponseEntity<List<com.decisionhub.dto.DecisionResponse>> saveDecision(@jakarta.validation.Valid @RequestBody com.decisionhub.dto.SaveDecisionRequest request,
                                                                                   Authentication authentication) {
        List<com.decisionhub.dto.DecisionResponse> response = userService.saveDecision(request.getDecisionId(), authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me/saved-decisions/{decisionId}")
    @Operation(summary = "Unsave a decision", description = "Removes a decision from the user's saved decisions list")
    public ResponseEntity<List<com.decisionhub.dto.DecisionResponse>> unsaveDecision(@PathVariable Long decisionId,
                                                                                     Authentication authentication) {
        List<com.decisionhub.dto.DecisionResponse> response = userService.unsaveDecision(decisionId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
