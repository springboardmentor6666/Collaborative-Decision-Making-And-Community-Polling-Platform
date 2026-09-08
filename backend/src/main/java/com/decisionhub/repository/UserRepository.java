package com.decisionhub.repository;

import com.decisionhub.entity.AccountStatus;
import com.decisionhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByEmail(String email);

    List<User> findByAccountStatusAndScheduledDeletionAtLessThanEqual(AccountStatus status, LocalDateTime dateTime);
    List<User> findByAccountStatusAndDeactivateUntilLessThanEqual(AccountStatus status, LocalDateTime dateTime);

    long countByAccountStatus(AccountStatus status);
    long countByIsActiveTrue();
    long countByCreatedAtGreaterThanEqual(LocalDateTime date);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
