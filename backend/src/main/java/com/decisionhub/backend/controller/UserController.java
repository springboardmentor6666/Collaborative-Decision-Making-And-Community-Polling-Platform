package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.*;
import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.repository.CommentRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.VoteRepository;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.UserProfileService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService service;
    private final CurrentUserService current;
    private final DecisionRepository decisions;
    private final VoteRepository votes;
    private final CommentRepository comments;
    private final CommunityRepository communities;

    public UserController(
            UserProfileService service,
            CurrentUserService current,
            DecisionRepository decisions,
            VoteRepository votes,
            CommentRepository comments,
            CommunityRepository communities
    ) {
        this.service = service;
        this.current = current;
        this.decisions = decisions;
        this.votes = votes;
        this.comments = comments;
        this.communities = communities;
    }


    @GetMapping("/profile")
    public ProfileResponse profile() {

        return service.get();
    }


    // Builds a single reverse-chronological timeline of the current user's
    // own decisions, votes, comments and community joins. Frontend
    // (pages/Activity.jsx) matches on the exact "type" strings below.
    @GetMapping("/activity")
    public List<Map<String, Object>> activity() {

        User user = current.get();

        List<Map<String, Object>> events = new ArrayList<>();

        List<Decision> myDecisions = decisions.findByCreatedBy(user);
        for (Decision decision : myDecisions) {
            events.add(event("Decision created", decision.getTitle(), decision.getCreatedAt()));
        }

        List<Vote> myVotes = votes.findByUser(user);
        for (Vote vote : myVotes) {
            String subject = vote.getDecision() != null ? vote.getDecision().getTitle() : null;
            events.add(event("Vote submitted", subject, vote.getCreatedAt()));
        }

        List<Comment> myComments = comments.findByUser(user);
        for (Comment comment : myComments) {
            String subject = comment.getDecision() != null ? comment.getDecision().getTitle() : null;
            events.add(event("Comment created", subject, comment.getCreatedAt()));
        }

        for (Community community : communities.findAll()) {
            boolean isMember = community.getMembers().stream()
                    .anyMatch(member -> member.getId().equals(user.getId()));
            if (isMember) {
                events.add(event("Community joined", community.getCommunityName(), community.getCreatedAt()));
            }
        }

        events.sort(Comparator.comparing(
                (Map<String, Object> event) -> (LocalDateTime) event.get("at"),
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        return events;
    }

    private Map<String, Object> event(String type, String subject, LocalDateTime at) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("type", type);
        event.put("subject", subject);
        event.put("at", at);
        return event;
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