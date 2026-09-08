package com.decisionhub.repository;

import com.decisionhub.entity.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    List<PollOption> findByPollId(Long pollId);
    List<PollOption> findByOptionId(Long optionId);
    void deleteByOptionId(Long optionId);
}
