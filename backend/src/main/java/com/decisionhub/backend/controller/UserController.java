package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.*;
import com.decisionhub.backend.service.UserProfileService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

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
}