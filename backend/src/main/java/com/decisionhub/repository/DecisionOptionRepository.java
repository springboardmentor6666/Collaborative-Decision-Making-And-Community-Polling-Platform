package com.decisionhub.repository;

import com.decisionhub.entity.DecisionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DecisionOptionRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'DecisionOption' entities.
 */
@Repository
public interface DecisionOptionRepository extends JpaRepository<DecisionOption, Long> {
    List<DecisionOption> findByDecisionId(Long decisionId);
}
