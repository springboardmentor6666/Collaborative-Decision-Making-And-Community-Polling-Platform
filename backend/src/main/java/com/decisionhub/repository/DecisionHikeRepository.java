package com.decisionhub.repository;

import com.decisionhub.entity.DecisionHike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DecisionHikeRepository extends JpaRepository<DecisionHike, Long> {

    boolean existsByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    Optional<DecisionHike> findByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    void deleteByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    long countByDecisionDecisionId(Long decisionId);

    List<DecisionHike> findByUserUserIdAndDecisionDecisionIdIn(Long userId, Collection<Long> decisionIds);
}
