package com.monika.usermanagement.service;

import com.monika.usermanagement.dto.AssignRoleRequest;
import com.monika.usermanagement.dto.AssignRoleResponse;
import com.monika.usermanagement.dto.RoleRequest;
import com.monika.usermanagement.dto.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    RoleResponse createRole(RoleRequest roleRequest);

    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(UUID id);

    RoleResponse updateRole(UUID id, RoleRequest roleRequest);

    void deleteRole(UUID id);

    AssignRoleResponse assignRoleToUser(AssignRoleRequest assignRoleRequest);

    void removeRoleFromUser(AssignRoleRequest assignRoleRequest);
}