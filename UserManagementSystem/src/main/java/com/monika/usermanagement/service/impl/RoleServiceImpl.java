package com.monika.usermanagement.service.impl;

import com.monika.usermanagement.dto.AssignRoleRequest;
import com.monika.usermanagement.dto.AssignRoleResponse;
import com.monika.usermanagement.dto.RoleRequest;
import com.monika.usermanagement.dto.RoleResponse;
import com.monika.usermanagement.entity.Role;
import com.monika.usermanagement.entity.User;
import com.monika.usermanagement.exception.BadRequestException;
import com.monika.usermanagement.exception.ResourceNotFoundException;
import com.monika.usermanagement.repository.RoleRepository;
import com.monika.usermanagement.repository.UserRepository;
import com.monika.usermanagement.service.RoleService;
import com.monika.usermanagement.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private static final Logger log = LoggerFactory.getLogger(RoleServiceImpl.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public RoleResponse createRole(RoleRequest roleRequest) {
        log.info("Creating new role with name: {}", roleRequest.getName());

        if (roleRepository.findByName(roleRequest.getName()).isPresent()) {
            throw new BadRequestException(AppConstants.ROLE_ALREADY_EXISTS);
        }

        Role role = new Role();
        role.setName(roleRequest.getName());
        role.setDescription(roleRequest.getDescription());
        role.setCreatedAt(LocalDateTime.now());

        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully with id: {}", savedRole.getId());

        return mapToResponse(savedRole);
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        log.info("Fetching all roles");
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponse getRoleById(UUID id) {
        log.info("Fetching role with id: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ROLE_NOT_FOUND));
        return mapToResponse(role);
    }

    @Override
    public RoleResponse updateRole(UUID id, RoleRequest roleRequest) {
        log.info("Updating role with id: {}", id);
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ROLE_NOT_FOUND));

        String newName = roleRequest.getName();
        if (newName != null && !newName.equals(existingRole.getName())
                && roleRepository.findByName(newName).isPresent()) {
            throw new BadRequestException(AppConstants.ROLE_ALREADY_EXISTS);
        }

        existingRole.setName(newName);
        existingRole.setDescription(roleRequest.getDescription());

        Role updatedRole = roleRepository.save(existingRole);
        log.info("Role updated successfully with id: {}", updatedRole.getId());

        return mapToResponse(updatedRole);
    }

    @Override
    public void deleteRole(UUID id) {
        log.info("Deleting role with id: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ROLE_NOT_FOUND));
        roleRepository.delete(role);
        log.info("Role deleted successfully with id: {}", id);
    }

    @Override
    public AssignRoleResponse assignRoleToUser(AssignRoleRequest assignRoleRequest) {
        log.info("Assigning role {} to user {}", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());

        UUID userId;
        try {
            userId = UUID.fromString(assignRoleRequest.getUserId());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid user ID format");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assignRoleRequest.getUserId()));

        Role role = roleRepository.findByName(assignRoleRequest.getRoleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + assignRoleRequest.getRoleName()));

        List<Role> currentRoles = user.getRoles();
        boolean alreadyAssigned = currentRoles.stream()
                .anyMatch(r -> r.getId().equals(role.getId()));

        if (alreadyAssigned) {
            throw new BadRequestException("User already has role: " + assignRoleRequest.getRoleName());
        }

        currentRoles.add(role);
        user.setRoles(currentRoles);
        userRepository.save(user);

        log.info("Role {} assigned to user {} successfully", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());

        return AssignRoleResponse.builder()
                .userId(user.getId())
                .roleId(role.getId())
                .roleName(role.getName())
                .message("Role assigned successfully")
                .build();
    }

    @Override
    public void removeRoleFromUser(AssignRoleRequest assignRoleRequest) {
        log.info("Removing role {} from user {}", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());

        UUID userId;
        try {
            userId = UUID.fromString(assignRoleRequest.getUserId());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid user ID format");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assignRoleRequest.getUserId()));

        Role role = roleRepository.findByName(assignRoleRequest.getRoleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + assignRoleRequest.getRoleName()));

        List<Role> currentRoles = user.getRoles();
        boolean removed = currentRoles.removeIf(r -> r.getId().equals(role.getId()));

        if (!removed) {
            throw new BadRequestException("User does not have role: " + assignRoleRequest.getRoleName());
        }

        user.setRoles(currentRoles);
        userRepository.save(user);

        log.info("Role {} removed from user {} successfully", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());
    }

    private RoleResponse mapToResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .build();
    }
}