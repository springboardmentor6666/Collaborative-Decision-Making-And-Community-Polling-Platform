package com.decisionhub.repository;

import com.decisionhub.entity.Vote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    @Query("SELECT COUNT(v) FROM Vote v JOIN v.selections s WHERE s.option.optionId = :optionId")
    long countByOptionOptionId(@Param("optionId") Long optionId);

    List<Vote> findByDecisionDecisionId(Long decisionId);

    List<Vote> findByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    boolean existsByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    long countByDecisionDecisionId(Long decisionId);

    Page<Vote> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserUserId(Long userId);

    void deleteByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    long countByCreatedAtAfter(LocalDateTime date);
}
