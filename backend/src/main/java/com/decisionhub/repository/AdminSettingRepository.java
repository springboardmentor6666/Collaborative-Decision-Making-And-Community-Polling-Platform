package com.decisionhub.repository;

import com.decisionhub.entity.AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AdminSettingRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'AdminSetting' entities.
 */
@Repository
public interface AdminSettingRepository extends JpaRepository<AdminSetting, Long> {
    Optional<AdminSetting> findBySettingKey(String settingKey);
}
