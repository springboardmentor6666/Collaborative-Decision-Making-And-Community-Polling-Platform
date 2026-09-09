package com.decisionhub.repository;

import com.decisionhub.entity.DecisionImpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DecisionImpressionRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'DecisionImpression' entities.
 */
@Repository
public interface DecisionImpressionRepository extends JpaRepository<DecisionImpression, Long> {

    long countByDecisionIdAndType(Long decisionId, String type);

    long countByDecision_Owner_IdAndType(Long ownerId, String type);
}
