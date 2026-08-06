package com.decisionhub.dto.response;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.common.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long userId;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String profileImage;
    private String bio;
    private RoleType role;
    private AuthProvider provider;
    private AccountStatus accountStatus;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
