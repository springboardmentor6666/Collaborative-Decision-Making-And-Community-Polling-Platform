package com.decisionhub.repository;

import com.decisionhub.entity.VotingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface VotingCategoryRepository extends JpaRepository<VotingCategory, Long>, JpaSpecificationExecutor<VotingCategory> {
    List<VotingCategory> findByVotingEventEventId(Long eventId);
    List<VotingCategory> findByVotingEventEventIdOrderByDisplayOrderAsc(Long eventId);
}
