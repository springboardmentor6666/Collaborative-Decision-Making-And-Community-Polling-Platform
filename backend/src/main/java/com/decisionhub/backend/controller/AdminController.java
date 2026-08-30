package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.AdminUserResponse;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.dto.RoleUpdateRequest;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.*;
import com.decisionhub.backend.service.CommunityService;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.DecisionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository users;
    private final DecisionRepository decisions;
    private final CommunityRepository communities;
    private final VoteRepository votes;
    private final CommentRepository comments;
    private final DecisionService decisionService;
    private final CommunityService communityService;
    private final CurrentUserService currentUserService;

    public AdminController(
            UserRepository users,
            DecisionRepository decisions,
            CommunityRepository communities,
            VoteRepository votes,
            CommentRepository comments,
            DecisionService decisionService,
            CommunityService communityService,
            CurrentUserService currentUserService
    ) {
        this.users = users;
        this.decisions = decisions;
        this.communities = communities;
        this.votes = votes;
        this.comments = comments;
        this.decisionService = decisionService;
        this.communityService = communityService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {

        return Map.of(
                "totalUsers", users.count(),
                "totalDecisions", decisions.count(),
                "totalCommunities", communities.count(),
                "totalVotes", votes.count()
        );
    }

    // ===================== USER MANAGEMENT =====================

    @GetMapping("/users")
    public List<AdminUserResponse> allUsers() {

        return users.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PatchMapping("/users/{id}/role")
    public AdminUserResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request
    ) {

        User target = users.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found."));

        User me = currentUserService.get();

        if (target.getId().equals(me.getId())) {
            throw new IllegalStateException(
                    "You can't change your own role."
            );
        }

        Role newRole;

        try {
            newRole = Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("That role doesn't exist.");
        }

        boolean demotingLastAdmin =
                target.getRole() == Role.ADMIN
                        && newRole != Role.ADMIN
                        && users.countByRole(Role.ADMIN) <= 1;

        if (demotingLastAdmin) {
            throw new IllegalStateException(
                    "Can't change the role of the last remaining admin."
            );
        }

        target.setRole(newRole);
        users.save(target);

        return toResponse(target);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {

        User target = users.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found."));

        User me = currentUserService.get();

        if (target.getId().equals(me.getId())) {
            throw new IllegalStateException(
                    "You can't delete your own account while logged in as admin."
            );
        }

        boolean deletingLastAdmin =
                target.getRole() == Role.ADMIN
                        && users.countByRole(Role.ADMIN) <= 1;

        if (deletingLastAdmin) {
            throw new IllegalStateException(
                    "Can't delete the last remaining admin."
            );
        }

        users.deleteById(id);
    }

    private AdminUserResponse toResponse(User user) {

        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ===================== CONTENT MANAGEMENT: DECISIONS =====================

    @GetMapping("/decisions")
    public List<DecisionResponse> allDecisions() {

        return decisions.findAll()
                .stream()
                .map(decisionService::toResponse)
                .toList();
    }

    @DeleteMapping("/decisions/{id}")
    public void deleteDecision(@PathVariable Long id) {

        if (!decisions.existsById(id)) {
            throw new NoSuchElementException("Decision not found.");
        }

        decisions.deleteById(id);
    }

    // ===================== CONTENT MANAGEMENT: COMMENTS =====================
    // These bypass the owner-only check used by the regular comment endpoint,
    // since an admin must be able to moderate any user's comment.

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {

        if (!comments.existsById(id)) {
            throw new NoSuchElementException("Comment not found.");
        }

        comments.deleteById(id);
    }

    // ===================== CONTENT MANAGEMENT: COMMUNITIES =====================

    @GetMapping("/communities")
    public List<CommunityResponse> allCommunities() {

        return communityService.getAllCommunities();
    }

    @DeleteMapping("/communities/{id}")
    public void deleteCommunity(@PathVariable Long id) {

        if (!communities.existsById(id)) {
            throw new NoSuchElementException("Community not found.");
        }

        // Deletes directly, bypassing the owner-only check in
        // CommunityService, since an admin must be able to remove
        // any community regardless of who owns it.
        communities.deleteById(id);
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {

        Map<String, Long> categoryBreakdown = decisions.findAll()
                .stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        d -> (d.getCategory() == null || d.getCategory().isBlank())
                                ? "Uncategorized"
                                : d.getCategory(),
                        java.util.stream.Collectors.counting()
                ));

        List<Map<String, Object>> communityActivity = communities.findAll()
                .stream()
                .map(c -> (Map<String, Object>) new java.util.LinkedHashMap<String, Object>() {{
                    put("name", c.getCommunityName());
                    put("members", c.getMembers().size());
                }})
                .sorted((a, b) -> ((Integer) b.get("members")).compareTo((Integer) a.get("members")))
                .limit(6)
                .toList();

        return Map.of(
                "categoryBreakdown", categoryBreakdown,
                "communityActivity", communityActivity
        );
    }
}