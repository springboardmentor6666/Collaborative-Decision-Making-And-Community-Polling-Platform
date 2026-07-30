package com.decisionhub.controller;

import com.decisionhub.dto.ProfileResponse;
import com.decisionhub.dto.ProfileUpdateRequest;
import com.decisionhub.response.ApiResponse;
import com.decisionhub.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile management endpoints")
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get current user profile", description = "Returns the profile information of the authenticated user")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - no valid JWT token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getProfile() {
        log.info("REST request to get current profile");
        ProfileResponse profileResponse = profileService.getCurrentUserProfile();
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Profile retrieved successfully").data(profileResponse).build(),
                HttpStatus.OK
        );
    }

    @PutMapping
    @Operation(summary = "Update current user profile", description = "Updates the first name, last name, and phone of the authenticated user")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - no valid JWT token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest updateRequest) {
        log.info("REST request to update current profile");
        ProfileResponse profileResponse = profileService.updateCurrentUserProfile(updateRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Profile updated successfully").data(profileResponse).build(),
                HttpStatus.OK
        );
    }
}
