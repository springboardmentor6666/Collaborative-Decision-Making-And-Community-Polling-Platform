package com.decisionhub.repository;

import com.decisionhub.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: NotificationPreferenceRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'NotificationPreference' entities.
 */
@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserId(Long userId);
    Optional<NotificationPreference> findByUserEmail(String email);
    void deleteByUserId(Long userId);
}
