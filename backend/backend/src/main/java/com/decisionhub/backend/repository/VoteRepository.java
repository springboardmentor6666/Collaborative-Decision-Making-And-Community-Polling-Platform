package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {
}
