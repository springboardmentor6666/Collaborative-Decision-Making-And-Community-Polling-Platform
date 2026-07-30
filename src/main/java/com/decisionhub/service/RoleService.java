package com.decisionhub.service;

import com.decisionhub.dto.AssignRoleRequest;
import com.decisionhub.dto.AssignRoleResponse;
import com.decisionhub.dto.RoleRequest;
import com.decisionhub.dto.RoleResponse;

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
