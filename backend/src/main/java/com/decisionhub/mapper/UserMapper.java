package com.decisionhub.mapper;

import com.decisionhub.dto.request.RegisterRequest;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "role", source = "role.roleName")
    UserResponse toResponse(User user);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "accountStatus", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "profileImage", ignore = true)
    User toEntity(RegisterRequest request);
}
