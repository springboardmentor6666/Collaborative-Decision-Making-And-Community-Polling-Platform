package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Decision;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
}