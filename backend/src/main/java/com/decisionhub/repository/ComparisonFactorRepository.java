package com.decisionhub.repository;

import com.decisionhub.entity.ComparisonFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// TODO: Add custom query methods for comparison factor management
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ComparisonFactorRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'ComparisonFactor' entities.
 */
@Repository
public interface ComparisonFactorRepository extends JpaRepository<ComparisonFactor, Long> {
    List<ComparisonFactor> findByDecisionId(Long decisionId);
}
