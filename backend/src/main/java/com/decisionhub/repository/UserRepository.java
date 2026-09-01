package com.decisionhub.repository;

import com.decisionhub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.email = :identifier")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    @Query(value = "SELECT COUNT(*) > 0 FROM app_user WHERE LOWER(email) = LOWER(:email)", nativeQuery = true)
    boolean existsByEmailIncludingDeleted(@Param("email") String email);

    @Query(value = "SELECT COUNT(*) > 0 FROM app_user WHERE LOWER(username) = LOWER(:username)", nativeQuery = true)
    boolean existsByUsernameIncludingDeleted(@Param("username") String username);

    Page<User> findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(String fullName, String username, Pageable pageable);

    long countByCreatedAtAfter(LocalDateTime date);
}
