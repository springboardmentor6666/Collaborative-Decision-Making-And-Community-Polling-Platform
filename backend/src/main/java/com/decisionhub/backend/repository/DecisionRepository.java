package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DecisionRepository
        extends JpaRepository<Decision, Long> {

    List<Decision> findByCreatedBy(User user);
}