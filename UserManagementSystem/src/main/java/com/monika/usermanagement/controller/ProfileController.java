package com.monika.usermanagement.controller;

import com.monika.usermanagement.dto.ProfileResponse;
import com.monika.usermanagement.dto.ProfileUpdateRequest;
import com.monika.usermanagement.response.ApiResponse;
import com.monika.usermanagement.service.ProfileService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse> getCurrentUserProfile() {
        log.info("REST request to get current user profile");
        ProfileResponse profileResponse = profileService.getCurrentUserProfile();
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Profile retrieved successfully")
                        .data(profileResponse)
                        .build(),
                HttpStatus.OK
        );
    }

    @PutMapping
    public ResponseEntity<ApiResponse> updateCurrentUserProfile(@Valid @RequestBody ProfileUpdateRequest profileUpdateRequest) {
        log.info("REST request to update current user profile");
        ProfileResponse profileResponse = profileService.updateCurrentUserProfile(profileUpdateRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Profile updated successfully")
                        .data(profileResponse)
                        .build(),
                HttpStatus.OK
        );
    }
}
