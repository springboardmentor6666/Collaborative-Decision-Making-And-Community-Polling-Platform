package com.decisionhub.repository;

import com.decisionhub.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    Optional<UserPreference> findByUserUserId(Long userId);
    
    boolean existsByUserUserId(Long userId);
}
