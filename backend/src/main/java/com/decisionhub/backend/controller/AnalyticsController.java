package com.decisionhub.backend.controller;

import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.*;
import com.decisionhub.backend.service.CurrentUserService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

  private final DecisionRepository decisions;
  private final VoteRepository votes;
  private final CommunityRepository communities;
  private final CurrentUserService current;

  public AnalyticsController(
          DecisionRepository decisions,
          VoteRepository votes,
          CommunityRepository communities,
          CurrentUserService current
  ) {
    this.decisions = decisions;
    this.votes = votes;
    this.communities = communities;
    this.current = current;
  }

  @GetMapping("/overview")
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
}