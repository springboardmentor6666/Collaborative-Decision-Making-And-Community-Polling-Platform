package com.decisionhub.repository;

import com.decisionhub.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// TODO: Add custom query methods for user profile operations
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UserProfileRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'UserProfile' entities.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);
}
