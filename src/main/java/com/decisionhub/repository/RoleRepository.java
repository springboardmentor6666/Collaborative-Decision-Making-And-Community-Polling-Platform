package com.decisionhub.repository;

import com.decisionhub.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, java.util.UUID> {

    Optional<Role> findByName(String name);
}
