package com.decisionhub.repository;

import com.decisionhub.common.enums.RoleType;
import com.decisionhub.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleName(RoleType roleName);

    boolean existsByRoleName(RoleType roleName);
}
