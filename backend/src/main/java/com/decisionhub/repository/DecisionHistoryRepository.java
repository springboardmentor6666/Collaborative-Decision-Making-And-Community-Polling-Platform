package com.decisionhub.repository;

import com.decisionhub.entity.DecisionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DecisionHistoryRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'DecisionHistory' entities.
 */
@Repository
public interface DecisionHistoryRepository extends JpaRepository<DecisionHistory, Long> {
    List<DecisionHistory> findByDecisionIdOrderByChangedAtDesc(Long decisionId);
}
