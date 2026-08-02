package com.decisionhub.repository;

import com.decisionhub.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {

    List<Option> findByDecisionDecisionId(Long decisionId);

    @Modifying
    @Query("UPDATE Option o SET o.totalScore = o.totalScore + :scoreDelta WHERE o.optionId = :optionId")
    void updateOptionScore(@Param("optionId") Long optionId, @Param("scoreDelta") BigDecimal scoreDelta);

    long countByDecisionDecisionId(Long decisionId);
}
