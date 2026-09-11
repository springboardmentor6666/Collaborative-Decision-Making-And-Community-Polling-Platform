package com.decisionhub.repository;

import com.decisionhub.entity.DecisionView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DecisionViewRepository extends JpaRepository<DecisionView, Long> {

    boolean existsByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    Optional<DecisionView> findByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    long countByDecisionDecisionId(Long decisionId);

    List<DecisionView> findByUserUserIdAndDecisionDecisionIdIn(Long userId, Collection<Long> decisionIds);
}
