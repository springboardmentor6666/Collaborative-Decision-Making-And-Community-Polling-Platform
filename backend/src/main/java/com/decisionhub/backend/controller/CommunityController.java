package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    @Autowired private CommunityService communityService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<CommunityResponse> createCommunity(@Valid @RequestBody CommunityRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(communityService.createCommunity(req, email));
    }

    @GetMapping
    public ResponseEntity<List<CommunityResponse>> getAllCommunities() {
        String authName = SecurityContextHolder.getContext().getAuthentication().getName();
        String email = "anonymousUser".equals(authName) ? null : authName;
        return ResponseEntity.ok(communityService.getAllCommunities(email));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<CommunityResponse>> getCommunitiesByCategory(@PathVariable String category) {
        String authName = SecurityContextHolder.getContext().getAuthentication().getName();
        String email = "anonymousUser".equals(authName) ? null : authName;
        return ResponseEntity.ok(communityService.getCommunitiesByCategory(category, email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponse> getCommunityById(@PathVariable Long id) {
        String authName = SecurityContextHolder.getContext().getAuthentication().getName();
        String email = "anonymousUser".equals(authName) ? null : authName;
        return ResponseEntity.ok(communityService.getCommunityById(id, email));
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> joinCommunity(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        communityService.joinCommunity(id, email);
        return ResponseEntity.ok().body("Joined community successfully");
    }

    @PostMapping("/{id}/leave")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> leaveCommunity(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        communityService.leaveCommunity(id, email);
        return ResponseEntity.ok().body("Left community successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteCommunity(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        communityService.deleteCommunity(id, email);
        return ResponseEntity.ok().body("Community deleted successfully");
    }
}
