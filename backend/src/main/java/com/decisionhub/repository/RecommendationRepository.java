package com.decisionhub.repository;

import com.decisionhub.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: RecommendationRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'Recommendation' entities.
 */
@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByDecisionId(Long decisionId);
}
