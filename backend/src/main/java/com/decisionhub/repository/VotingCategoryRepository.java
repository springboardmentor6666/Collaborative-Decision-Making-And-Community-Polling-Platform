package com.decisionhub.repository;

import com.decisionhub.entity.VotingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VotingCategoryRepository extends JpaRepository<VotingCategory, Long>, JpaSpecificationExecutor<VotingCategory> {
    List<VotingCategory> findByVotingEventEventId(Long eventId);
    List<VotingCategory> findByVotingEventEventIdOrderByDisplayOrderAsc(Long eventId);
}
