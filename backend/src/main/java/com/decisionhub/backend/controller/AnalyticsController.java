package com.decisionhub.backend.controller;

import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.repository.*;
import com.decisionhub.backend.service.CurrentUserService;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
public class AnalyticsController {

  private final DecisionRepository decisions;
  private final VoteRepository votes;
  private final CommunityRepository communities;
        private final CommentRepository comments;
  private final CurrentUserService current;

  public AnalyticsController(
          DecisionRepository decisions,
          VoteRepository votes,
          CommunityRepository communities,
          CommentRepository comments,
          CurrentUserService current
  ) {
    this.decisions = decisions;
    this.votes = votes;
    this.communities = communities;
        this.comments = comments;
    this.current = current;
  }

        @GetMapping("/api/analytics/overview")
  public Map<String, Object> overview() {

    User user = current.get();

    long total = decisions.count();

    long completed =
            decisions.countByDeadlineBefore(
                    LocalDate.now()
            );

    return Map.of(
            "totalDecisions", total,
            "activePolls", total - completed,
            "completedDecisions", completed,
            "totalVotes", votes.count(),
            "totalCommunities", communities.count(),
            "myDecisions", decisions.countByCreatedBy(user),
            "myVotes", votes.countByUser(user)
    );
  }

        @GetMapping("/api/user/analytics")
        @Transactional(readOnly = true)
        public Map<String, Object> userAnalytics(
                        @RequestParam(defaultValue = "30") int days) {
        User user = current.get();
                int selectedDays = Math.max(1, Math.min(days, 365));
        List<Decision> myDecisions = decisions.findByCreatedBy(user);
        List<Vote> myVotes = votes.findByUser(user);
        List<Comment> myComments = comments.findByUser(user);
        Set<Long> myDecisionIds = myDecisions.stream().map(Decision::getId).collect(Collectors.toSet());
        List<Vote> receivedVotes = votes.findAll().stream()
                .filter(vote -> vote.getDecision() != null && myDecisionIds.contains(vote.getDecision().getId())).toList();
        List<Comment> receivedComments = comments.findAll().stream()
                .filter(comment -> comment.getDecision() != null && myDecisionIds.contains(comment.getDecision().getId())).toList();
        LocalDateTime since = LocalDateTime.now().minusDays(selectedDays);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", Map.of(
                "totalDecisions", myDecisions.size(),
                "activeDecisions", myDecisions.stream().filter(this::isActive).count(),
                "completedDecisions", myDecisions.stream().filter(decision -> !isActive(decision)).count(),
                "publicDecisions", myDecisions.stream().filter(decision -> "PUBLIC".equalsIgnoreCase(decision.getVisibility())).count(),
                "privateDecisions", myDecisions.stream().filter(decision -> "PRIVATE".equalsIgnoreCase(decision.getVisibility())).count(),
                "anonymousDecisions", myDecisions.stream().filter(Decision::isAnonymous).count(),
                "votesCast", myVotes.size(),
                "votesReceived", receivedVotes.size(),
                "commentsWritten", myComments.size(),
                "commentsReceived", receivedComments.size()));
        result.put("rangeDays", selectedDays);
        result.put("trend", dailyTrend(myDecisions, since, selectedDays));
        result.put("distribution", distribution(myDecisions));
        result.put("categories", myDecisions.stream().collect(Collectors.groupingBy(
                decision -> category(decision), Collectors.counting())).entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()).map(entry -> Map.of(
                        "category", entry.getKey(), "decisions", entry.getValue())).toList());
        result.put("options", myDecisions.stream().flatMap(decision -> decision.getOptions().stream())
                .collect(Collectors.groupingBy(option -> option.getOptionText(), Collectors.counting())).entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()).limit(5).map(entry -> Map.of(
                        "option", entry.getKey(), "count", entry.getValue())).toList());
        result.put("communities", userCommunities(user, myDecisions, myVotes, myComments));
        result.put("topDecisions", topDecisions(myDecisions, receivedVotes, receivedComments));
                result.put("recentDecisions", myDecisions.stream().sorted(Comparator.comparing(Decision::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                                .limit(5).map(this::recentDecisionRow).toList());
        return result;
  }

        private Map<String, Object> recentDecisionRow(Decision decision) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", decision.getId());
                row.put("title", decision.getTitle());
                row.put("category", category(decision));
                row.put("visibility", decision.getVisibility());
                row.put("deadline", decision.getDeadline());
                row.put("createdAt", decision.getCreatedAt());
                return row;
        }

  private boolean isActive(Decision decision) { return decision.getDeadline() == null || decision.getDeadline().isAfter(LocalDateTime.now()); }
  private String category(Decision decision) { return decision.getCategory() == null || decision.getCategory().isBlank() ? "Uncategorized" : decision.getCategory(); }

        private List<Map<String, Object>> distribution(List<Decision> myDecisions) {
                List<Map<String, Object>> result = new ArrayList<>();
                long publicCount = myDecisions.stream().filter(decision -> "PUBLIC".equalsIgnoreCase(decision.getVisibility())).count();
                long privateCount = myDecisions.stream().filter(decision -> "PRIVATE".equalsIgnoreCase(decision.getVisibility())).count();
                long anonymousCount = myDecisions.stream().filter(Decision::isAnonymous).count();
                long communityCount = myDecisions.stream().filter(decision -> decision.getCommunity() != null).count();
                if (publicCount > 0) result.add(Map.of("name", "Public", "value", publicCount));
                if (privateCount > 0) result.add(Map.of("name", "Private", "value", privateCount));
                if (anonymousCount > 0) result.add(Map.of("name", "Anonymous", "value", anonymousCount));
                if (communityCount > 0) result.add(Map.of("name", "Community", "value", communityCount));
                return result;
        }

        private List<Map<String, Object>> topDecisions(List<Decision> myDecisions, List<Vote> receivedVotes,
                                                                                                                                                                                                        List<Comment> receivedComments) {
                return myDecisions.stream().map(decision -> {
                        long voteCount = receivedVotes.stream().filter(vote -> vote.getDecision().getId().equals(decision.getId())).count();
                        long commentCount = receivedComments.stream().filter(comment -> comment.getDecision().getId().equals(decision.getId())).count();
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("id", decision.getId());
                        row.put("title", decision.getTitle());
                        row.put("votes", voteCount);
                        row.put("comments", commentCount);
                        row.put("engagement", voteCount + commentCount);
                        return row;
                }).sorted(Comparator.comparingLong((Map<String, Object> row) -> ((Number) row.get("engagement")).longValue()).reversed())
                                .limit(5).toList();
        }

        private List<Map<String, Object>> dailyTrend(List<Decision> myDecisions, LocalDateTime since, int days) {
        List<Map<String, Object>> trend = new ArrayList<>();
                for (int offset = days - 1; offset >= 0; offset--) {
          LocalDate date = LocalDate.now().minusDays(offset);
          LocalDateTime start = date.atStartOfDay();
          LocalDateTime end = start.plusDays(1);
          long count = myDecisions.stream().filter(decision -> decision.getCreatedAt() != null
                  && !decision.getCreatedAt().isBefore(since) && !decision.getCreatedAt().isBefore(start)
                  && decision.getCreatedAt().isBefore(end)).count();
          trend.add(Map.of("date", date.toString(), "decisions", count));
        }
        return trend;
  }

  private List<Map<String, Object>> userCommunities(User user, List<Decision> myDecisions,
                                                                                                         List<Vote> myVotes, List<Comment> myComments) {
        return communities.findAll().stream().filter(community -> community.getMembers().stream()
                .anyMatch(member -> member.getId().equals(user.getId()))).map(community -> {
          Set<Long> decisionIds = myDecisions.stream().filter(decision -> decision.getCommunity() != null
                  && decision.getCommunity().getId().equals(community.getId())).map(Decision::getId).collect(Collectors.toSet());
          return Map.<String, Object>of("id", community.getId(), "name", community.getCommunityName(),
                  "decisionsCreated", decisionIds.size(),
                  "votesCast", myVotes.stream().filter(vote -> vote.getDecision().getCommunity() != null
                          && vote.getDecision().getCommunity().getId().equals(community.getId())).count(),
                  "commentsWritten", myComments.stream().filter(comment -> comment.getDecision().getCommunity() != null
                          && comment.getDecision().getCommunity().getId().equals(community.getId())).count());
        }).toList();
  }
}