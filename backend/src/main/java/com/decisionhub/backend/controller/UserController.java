package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.UserProfileDTO;
import com.decisionhub.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(Authentication authentication) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "user";
        return ResponseEntity.ok(userService.getUserProfile(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody UserProfileDTO dto, Authentication authentication) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "user";
        return ResponseEntity.ok(userService.updateUserProfile(username, dto));
    }
}
