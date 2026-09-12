package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommunityDTO;
import com.decisionhub.backend.service.CommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @GetMapping
    public ResponseEntity<List<CommunityDTO>> getAllCommunities() {
        return ResponseEntity.ok(communityService.getAllCommunities());
    }

    @PostMapping
    public ResponseEntity<CommunityDTO> createCommunity(@RequestBody CommunityDTO dto, Authentication authentication) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "user";
        return ResponseEntity.ok(communityService.createCommunity(dto, username));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Boolean> joinCommunity(@PathVariable Long id, Authentication authentication) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "user";
        return ResponseEntity.ok(communityService.joinCommunity(id, username));
    }
}
