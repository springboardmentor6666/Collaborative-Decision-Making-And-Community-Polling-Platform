package com.decisionhub.mapper;

import com.decisionhub.common.enums.RoleType;
import com.decisionhub.dto.request.RegisterRequest;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-11T20:45:37+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.userId( user.getUserId() );
        userResponse.role( userRoleRoleName( user ) );
        userResponse.accountStatus( user.getAccountStatus() );
        userResponse.bio( user.getBio() );
        userResponse.createdAt( user.getCreatedAt() );
        userResponse.email( user.getEmail() );
        userResponse.emailVerified( user.isEmailVerified() );
        userResponse.fullName( user.getFullName() );
        userResponse.phone( user.getPhone() );
        userResponse.profileImage( user.getProfileImage() );
        userResponse.provider( user.getProvider() );
        userResponse.username( user.getUsername() );

        return userResponse.build();
    }

    @Override
    public User toEntity(RegisterRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.bio( request.getBio() );
        user.email( request.getEmail() );
        user.fullName( request.getFullName() );
        user.password( request.getPassword() );
        user.phone( request.getPhone() );
        user.username( request.getUsername() );

        return user.build();
    }

    private RoleType userRoleRoleName(User user) {
        if ( user == null ) {
            return null;
        }
        Role role = user.getRole();
        if ( role == null ) {
            return null;
        }
        RoleType roleName = role.getRoleName();
        if ( roleName == null ) {
            return null;
        }
        return roleName;
    }
}
