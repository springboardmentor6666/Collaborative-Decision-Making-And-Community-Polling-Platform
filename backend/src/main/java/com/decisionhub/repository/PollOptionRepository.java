package com.decisionhub.repository;

import com.decisionhub.entity.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: PollOptionRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'PollOption' entities.
 */
@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    List<PollOption> findByPollId(Long pollId);
    List<PollOption> findByOptionId(Long optionId);
    void deleteByOptionId(Long optionId);
}
