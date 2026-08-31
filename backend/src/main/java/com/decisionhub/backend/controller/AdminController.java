package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.AdminUserResponse;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.dto.RoleUpdateRequest;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Report;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.*;
import com.decisionhub.backend.service.CommunityService;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.DecisionService;
import com.decisionhub.backend.entity.Decision;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository users;
    private final DecisionRepository decisions;
    private final CommunityRepository communities;
    private final VoteRepository votes;
    private final CommentRepository comments;
    private final ReportRepository reports;
    private final NotificationRepository notifications;
    private final CommunityMessageRepository communityMessages;
    private final DecisionService decisionService;
    private final CommunityService communityService;
    private final CurrentUserService currentUserService;

    public AdminController(
            UserRepository users,
            DecisionRepository decisions,
            CommunityRepository communities,
            VoteRepository votes,
            CommentRepository comments,
            ReportRepository reports,
            NotificationRepository notifications,
            CommunityMessageRepository communityMessages,
            DecisionService decisionService,
            CommunityService communityService,
            CurrentUserService currentUserService
    ) {
        this.users = users;
        this.decisions = decisions;
        this.communities = communities;
        this.votes = votes;
        this.comments = comments;
        this.reports = reports;
        this.notifications = notifications;
        this.communityMessages = communityMessages;
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
    @Transactional
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

        communities.findAll().stream()
            .filter(community -> community.getOwner() != null
                && community.getOwner().getId().equals(id))
            .toList()
            .forEach(community -> deleteCommunityAndDependencies(community));

        decisions.findAll().stream()
            .filter(decision -> decision.getCreatedBy() != null
                && decision.getCreatedBy().getId().equals(id))
            .toList()
            .forEach(this::deleteDecisionAndDependencies);

        comments.deleteAll(comments.findAll().stream()
            .filter(comment -> comment.getUser() != null && comment.getUser().getId().equals(id))
            .toList());
        votes.deleteAll(votes.findAll().stream()
            .filter(vote -> vote.getUser() != null && vote.getUser().getId().equals(id))
            .toList());
        reports.deleteAll(reports.findAll().stream()
            .filter(report -> report.getReportedBy() != null && report.getReportedBy().getId().equals(id))
            .toList());
        notifications.deleteAll(notifications.findAll().stream()
            .filter(notification -> notification.getUser() != null && notification.getUser().getId().equals(id))
            .toList());
        communityMessages.deleteAll(communityMessages.findAll().stream()
            .filter(message -> message.getUser() != null && message.getUser().getId().equals(id))
            .toList());

        communities.findAll().forEach(community -> {
            if (community.getMembers().removeIf(member -> member.getId().equals(id))) {
                communities.save(community);
            }
        });

        users.delete(target);
    }

    private void deleteDecisionAndDependencies(Decision decision) {
        reports.deleteAll(reports.findAll().stream()
            .filter(report -> report.getDecision() != null
                && report.getDecision().getId().equals(decision.getId()))
            .toList());
        votes.deleteAll(votes.findAll().stream()
            .filter(vote -> vote.getDecision() != null
                && vote.getDecision().getId().equals(decision.getId()))
            .toList());
        comments.deleteAll(comments.findAll().stream()
            .filter(comment -> comment.getDecision() != null
                && comment.getDecision().getId().equals(decision.getId()))
            .toList());
        decisions.delete(decision);
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

        Decision decision = decisions.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Decision not found."));
        deleteDecisionAndDependencies(decision);
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
    @Transactional
    public void deleteCommunity(@PathVariable Long id) {

        Community community = communities.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Community not found."));
        deleteCommunityAndDependencies(community);
    }

    private void deleteCommunityAndDependencies(Community community) {
        decisions.findByCommunityId(community.getId()).stream()
                .toList()
                .forEach(this::deleteDecisionAndDependencies);
        communityMessages.deleteAll(communityMessages.findByCommunityIdOrderByCreatedAtAsc(community.getId()));
        community.getMembers().clear();
        communities.saveAndFlush(community);
        communities.delete(community);
    }

        @GetMapping("/analytics")
        public Map<String, Object> analytics(
            @RequestParam(defaultValue = "30") int days) {
        int selectedDays = Math.max(1, Math.min(days, 3650));
        LocalDateTime since = LocalDateTime.now().minusDays(selectedDays);
        List<User> allUsers = users.findAll();
        List<Decision> allDecisions = decisions.findAll();
        List<Comment> allComments = comments.findAll();
        List<com.decisionhub.backend.entity.Vote> allVotes = votes.findAll();
        List<Community> allCommunities = communities.findAll();
        List<Report> allReports = reports.findAll();
        List<Decision> scopedDecisions = allDecisions.stream().filter(d -> after(d.getCreatedAt(), since)).toList();
        List<Comment> scopedComments = allComments.stream().filter(c -> after(c.getCreatedAt(), since)).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rangeDays", selectedDays);
        result.put("generatedAt", LocalDateTime.now());
        result.put("kpis", Map.of(
            "totalUsers", allUsers.size(),
            "activeUsers", activeUserIds(allDecisions, allVotes, allComments, since).size(),
            "totalDecisions", scopedDecisions.size(),
            "totalVotes", allVotes.stream().filter(v -> after(v.getDecision().getCreatedAt(), since)).count(),
            "totalComments", scopedComments.size(),
            "totalCommunities", allCommunities.size(),
            "communityMembers", allCommunities.stream().mapToInt(c -> c.getMembers().size()).sum(),
            "pendingReports", allReports.size(),
            "reportsSupported", false));
        result.put("activity", activitySeries(selectedDays, allUsers, allDecisions, allVotes, allComments));
        result.put("decisionSummary", Map.of(
            "public", scopedDecisions.stream().filter(d -> "PUBLIC".equalsIgnoreCase(d.getVisibility())).count(),
            "community", scopedDecisions.stream().filter(d -> d.getCommunity() != null).count(),
            "total", scopedDecisions.size()));
        result.put("engagement", Map.of(
            "totalVotes", allVotes.stream().filter(v -> after(v.getDecision().getCreatedAt(), since)).count(),
            "averageVotesPerDecision", average(allVotes.stream().filter(v -> after(v.getDecision().getCreatedAt(), since)).count(), scopedDecisions.size()),
            "votedUsers", activeVoterIds(allVotes, since).size(),
            "participationRate", percentage(activeVoterIds(allVotes, since).size(), allUsers.size()),
            "averageCommentsPerDecision", average(scopedComments.size(), scopedDecisions.size()),
            "totalComments", scopedComments.size()));
        result.put("communities", communityRows(allCommunities, allDecisions, allVotes, allComments, since));
        result.put("categories", categoryRows(scopedDecisions, allVotes, scopedComments));
        result.put("activeUsers", userRows(allUsers, allDecisions, allVotes, allComments, allCommunities, since));
        result.put("popularDecisions", popularDecisionRows(scopedDecisions, allVotes, allComments));
        result.put("moderation", moderationRows(allReports));
        result.put("recentActivity", recentActivity(allUsers, allDecisions, allVotes, allComments, allCommunities, since));
        result.put("insights", insights(allCommunities, allDecisions, scopedDecisions));
        return result;
    }

        private boolean after(LocalDateTime value, LocalDateTime since) { return value != null && !value.isBefore(since); }

        private Set<Long> activeUserIds(List<Decision> decisionList, List<com.decisionhub.backend.entity.Vote> voteList,
                       List<Comment> commentList, LocalDateTime since) {
        Set<Long> ids = new HashSet<>();
        decisionList.stream().filter(d -> after(d.getCreatedAt(), since) && d.getCreatedBy() != null)
            .forEach(d -> ids.add(d.getCreatedBy().getId()));
        voteList.stream().filter(v -> after(v.getDecision().getCreatedAt(), since)).forEach(v -> ids.add(v.getUser().getId()));
        commentList.stream().filter(c -> after(c.getCreatedAt(), since)).forEach(c -> ids.add(c.getUser().getId()));
        return ids;
        }

        private Set<Long> activeVoterIds(List<com.decisionhub.backend.entity.Vote> voteList, LocalDateTime since) {
        return voteList.stream().filter(v -> after(v.getDecision().getCreatedAt(), since))
            .map(v -> v.getUser().getId()).collect(Collectors.toSet());
        }

        private double average(long numerator, long denominator) { return denominator == 0 ? 0 : Math.round((double) numerator / denominator * 100) / 100.0; }
        private double percentage(long numerator, long denominator) { return denominator == 0 ? 0 : Math.round((double) numerator / denominator * 10000) / 100.0; }

        private List<Map<String, Object>> activitySeries(int days, List<User> userList, List<Decision> decisionList,
                                  List<com.decisionhub.backend.entity.Vote> voteList, List<Comment> commentList) {
        List<Map<String, Object>> series = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int offset = Math.min(days - 1, 89); offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = start.plusDays(1);
            long registrations = userList.stream().filter(u -> between(u.getCreatedAt(), start, end)).count();
            long active = activeUserIds(decisionList, voteList, commentList, start.minusNanos(1)).stream()
                .filter(id -> decisionList.stream().anyMatch(d -> d.getCreatedBy() != null && d.getCreatedBy().getId().equals(id) && between(d.getCreatedAt(), start, end))
                    || voteList.stream().anyMatch(v -> v.getUser().getId().equals(id) && between(v.getDecision().getCreatedAt(), start, end))
                    || commentList.stream().anyMatch(c -> c.getUser().getId().equals(id) && between(c.getCreatedAt(), start, end))).count();
                long createdDecisions = decisionList.stream().filter(d -> between(d.getCreatedAt(), start, end)).count();
                long createdVotes = voteList.stream().filter(v -> between(v.getDecision().getCreatedAt(), start, end)).count();
                long createdComments = commentList.stream().filter(c -> between(c.getCreatedAt(), start, end)).count();
                series.add(Map.of("date", date.toString(), "registrations", registrations, "activeUsers", active,
                    "decisions", createdDecisions, "votes", createdVotes, "comments", createdComments));
        }
        return series;
        }

        private boolean between(LocalDateTime value, LocalDateTime start, LocalDateTime end) { return value != null && !value.isBefore(start) && value.isBefore(end); }

        private List<Map<String, Object>> communityRows(List<Community> communityList, List<Decision> decisionList,
                                                         List<com.decisionhub.backend.entity.Vote> voteList,
                                                         List<Comment> commentList, LocalDateTime since) {
            return communityList.stream().map(community -> {
                List<Decision> communityDecisions = decisionList.stream()
                        .filter(d -> d.getCommunity() != null && d.getCommunity().getId().equals(community.getId()) && after(d.getCreatedAt(), since)).toList();
                Set<Long> decisionIds = communityDecisions.stream().map(Decision::getId).collect(Collectors.toSet());
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", community.getId());
                row.put("name", community.getCommunityName());
                row.put("owner", community.getOwner() == null ? "Unknown" : community.getOwner().getName());
                row.put("members", community.getMembers().size());
                row.put("decisions", communityDecisions.size());
                row.put("votes", voteList.stream().filter(v -> decisionIds.contains(v.getDecision().getId())).count());
                row.put("comments", commentList.stream().filter(c -> c.getDecision() != null && decisionIds.contains(c.getDecision().getId())).count());
                return row;
            }).sorted((a, b) -> Long.compare(((Number) b.get("members")).longValue(), ((Number) a.get("members")).longValue())).toList();
        }

        private List<Map<String, Object>> categoryRows(List<Decision> decisionList, List<com.decisionhub.backend.entity.Vote> voteList,
                                                       List<Comment> commentList) {
            return decisionList.stream().collect(Collectors.groupingBy(d -> d.getCategory() == null || d.getCategory().isBlank() ? "Uncategorized" : d.getCategory()))
                    .entrySet().stream().map(entry -> {
                        Set<Long> ids = entry.getValue().stream().map(Decision::getId).collect(Collectors.toSet());
                        return Map.<String, Object>of("category", entry.getKey(), "decisions", entry.getValue().size(),
                                "votes", voteList.stream().filter(v -> ids.contains(v.getDecision().getId())).count(),
                                "comments", commentList.stream().filter(c -> c.getDecision() != null && ids.contains(c.getDecision().getId())).count());
                    }).sorted((a, b) -> Long.compare(((Number) b.get("decisions")).longValue(), ((Number) a.get("decisions")).longValue())).toList();
        }

        private List<Map<String, Object>> userRows(List<User> userList, List<Decision> decisionList,
                                                   List<com.decisionhub.backend.entity.Vote> voteList, List<Comment> commentList,
                                                   List<Community> communityList, LocalDateTime since) {
            return userList.stream().map(user -> {
                long userDecisions = decisionList.stream().filter(d -> d.getCreatedBy() != null && d.getCreatedBy().getId().equals(user.getId()) && after(d.getCreatedAt(), since)).count();
                long userVotes = voteList.stream().filter(v -> v.getUser().getId().equals(user.getId()) && after(v.getDecision().getCreatedAt(), since)).count();
                long userComments = commentList.stream().filter(c -> c.getUser().getId().equals(user.getId()) && after(c.getCreatedAt(), since)).count();
                long userCommunities = communityList.stream().filter(c -> c.getMembers().stream().anyMatch(member -> member.getId().equals(user.getId()))).count();
                return Map.<String, Object>of("id", user.getId(), "name", user.getName(), "decisions", userDecisions,
                        "votes", userVotes, "comments", userComments, "communities", userCommunities,
                        "activity", userDecisions + userVotes + userComments);
            }).sorted((a, b) -> Long.compare(((Number) b.get("activity")).longValue(), ((Number) a.get("activity")).longValue())).limit(10).toList();
        }

        private List<Map<String, Object>> popularDecisionRows(List<Decision> decisionList,
                                                               List<com.decisionhub.backend.entity.Vote> voteList,
                                                               List<Comment> commentList) {
            return decisionList.stream().map(decision -> {
                long decisionVotes = voteList.stream().filter(v -> v.getDecision().getId().equals(decision.getId())).count();
                long decisionComments = commentList.stream().filter(c -> c.getDecision() != null && c.getDecision().getId().equals(decision.getId())).count();
                return Map.<String, Object>of("id", decision.getId(), "title", decision.getTitle(),
                        "creator", decision.getCreatedBy() == null ? "Unknown" : decision.getCreatedBy().getName(),
                        "category", decision.getCategory() == null ? "Uncategorized" : decision.getCategory(),
                        "type", decision.getCommunity() == null ? "PUBLIC" : "COMMUNITY", "votes", decisionVotes,
                        "comments", decisionComments, "deadline", decision.getDeadline(), "created", decision.getCreatedAt());
            }).sorted((a, b) -> Long.compare(((Number) b.get("votes")).longValue(), ((Number) a.get("votes")).longValue())).limit(10).toList();
        }

        private Map<String, Object> moderationRows(List<Report> reportList) {
            List<Map<String, Object>> recent = reportList.stream().map(report -> Map.<String, Object>of(
                    "id", report.getId(), "reason", report.getReason(),
                    "decision", report.getDecision() == null ? "Unknown" : report.getDecision().getTitle(),
                    "reportedBy", report.getReportedBy() == null ? "Unknown" : report.getReportedBy().getName())).limit(10).toList();
            return Map.of("total", reportList.size(), "statusSupported", false, "recent", recent);
        }

        private List<Map<String, Object>> recentActivity(List<User> userList, List<Decision> decisionList,
                                                         List<com.decisionhub.backend.entity.Vote> voteList, List<Comment> commentList,
                                                         List<Community> communityList, LocalDateTime since) {
            List<Map<String, Object>> events = new ArrayList<>();
            userList.stream().filter(u -> after(u.getCreatedAt(), since)).forEach(u -> events.add(event("User registered", u.getName(), "", u.getCreatedAt())));
            decisionList.stream().filter(d -> after(d.getCreatedAt(), since)).forEach(d -> events.add(event("Decision created", d.getCreatedBy() == null ? "Unknown" : d.getCreatedBy().getName(), d.getTitle(), d.getCreatedAt())));
            commentList.stream().filter(c -> after(c.getCreatedAt(), since)).forEach(c -> events.add(event("Comment created", c.getUser().getName(), c.getDecision().getTitle(), c.getCreatedAt())));
            communityList.stream().filter(c -> after(c.getCreatedAt(), since)).forEach(c -> events.add(event("Community created", c.getOwner() == null ? "Unknown" : c.getOwner().getName(), c.getCommunityName(), c.getCreatedAt())));
            voteList.stream().filter(v -> after(v.getDecision().getCreatedAt(), since)).forEach(v -> events.add(event("Vote submitted", v.getUser().getName(), v.getDecision().getTitle(), v.getDecision().getCreatedAt())));
            return events.stream().sorted((a, b) -> String.valueOf(b.get("at")).compareTo(String.valueOf(a.get("at")))).limit(20).toList();
        }

        private Map<String, Object> event(String type, String actor, String subject, LocalDateTime at) {
            return Map.of("type", type, "actor", actor, "subject", subject, "at", at);
        }

        private List<String> insights(List<Community> communityList, List<Decision> allDecisionList, List<Decision> scopedDecisionList) {
            List<String> result = new ArrayList<>();
            allDecisionList.stream().filter(d -> d.getCategory() != null && !d.getCategory().isBlank())
                    .collect(Collectors.groupingBy(Decision::getCategory, Collectors.counting())).entrySet().stream()
                    .max(Map.Entry.comparingByValue()).ifPresent(entry -> result.add(entry.getKey() + " is the most active category."));
            communityList.stream().max(Comparator.comparingInt(c -> c.getMembers().size()))
                    .ifPresent(c -> result.add(c.getCommunityName() + " has the highest membership."));
            if (scopedDecisionList.isEmpty()) result.add("No decision activity was recorded for this period.");
            return result;
        }
}