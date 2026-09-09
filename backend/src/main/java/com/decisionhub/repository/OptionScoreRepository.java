package com.decisionhub.repository;

import com.decisionhub.entity.OptionScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// TODO: Add custom query methods for option score analytics
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: OptionScoreRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'OptionScore' entities.
 */
@Repository
public interface OptionScoreRepository extends JpaRepository<OptionScore, Long> {
    List<OptionScore> findByOptionId(Long optionId);
    List<OptionScore> findByFactorId(Long factorId);
}
