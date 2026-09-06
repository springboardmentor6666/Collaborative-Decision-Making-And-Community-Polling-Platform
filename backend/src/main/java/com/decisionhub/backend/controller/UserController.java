package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.*;
import com.decisionhub.backend.service.UserProfileService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService service;

    public UserController(
            UserProfileService service
    ) {
        this.service = service;
    }


    @GetMapping("/profile")
    public ProfileResponse profile() {

        return service.get();
    }


    @PutMapping("/profile")
    public ProfileResponse update(
            @Valid @RequestBody ProfileUpdateRequest request
    ) {

        return service.update(request);
    }


    @PutMapping("/change-password")
    public Map<String, String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        service.changePassword(request);
        return Map.of("message", "Password changed successfully.");
    }


    @PostMapping("/delete-account")
    public Map<String, String> deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request
    ) {

        service.deleteAccount(request);
        return Map.of("message", "Account deleted successfully.");
    }

    @DeleteMapping("/account")
    public Map<String, String> deleteAccountViaDeleteMethod(
            @Valid @RequestBody DeleteAccountRequest request
    ) {

        service.deleteAccount(request);
        return Map.of("message", "Account deleted successfully.");
    }
}