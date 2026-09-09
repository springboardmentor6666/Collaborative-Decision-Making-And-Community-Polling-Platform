package com.decisionhub.repository;

import com.decisionhub.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: PollRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'Poll' entities.
 */
@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByDecisionId(Long decisionId);
}
