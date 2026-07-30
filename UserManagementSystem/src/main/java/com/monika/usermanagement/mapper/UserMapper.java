package com.monika.usermanagement.mapper;

import com.monika.usermanagement.dto.UpdateUserRequest;
import com.monika.usermanagement.dto.UserRequest;
import com.monika.usermanagement.dto.UserResponse;
import com.monika.usermanagement.dto.ProfileResponse;
import com.monika.usermanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "accountLocked", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toEntity(UserRequest userRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "accountLocked", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toEntity(UpdateUserRequest updateUserRequest);

    @Mapping(target = "roles", expression = "java(user.getRoles() != null ? user.getRoles().stream().map(com.monika.usermanagement.entity.Role::getName).collect(java.util.stream.Collectors.toSet()) : null)")
    UserResponse toResponse(User user);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    ProfileResponse toProfileResponse(User user);

    List<User> toEntityList(List<UserRequest> userRequests);

    List<UserResponse> toResponseList(List<User> users);
}