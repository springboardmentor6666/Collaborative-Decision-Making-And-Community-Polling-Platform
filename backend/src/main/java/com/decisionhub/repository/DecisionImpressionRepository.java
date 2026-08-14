package com.decisionhub.repository;

import com.decisionhub.entity.DecisionImpression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DecisionImpressionRepository extends JpaRepository<DecisionImpression, Long> {

    long countByDecisionIdAndType(Long decisionId, String type);

    long countByDecision_Owner_IdAndType(Long ownerId, String type);
}
