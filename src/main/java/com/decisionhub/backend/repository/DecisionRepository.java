package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, Long> {
    List<Decision> findByVisibility(String visibility);
    List<Decision> findByUserId(Long userId);
}
