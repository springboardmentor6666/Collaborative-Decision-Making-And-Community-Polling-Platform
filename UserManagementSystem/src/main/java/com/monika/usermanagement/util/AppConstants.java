package com.monika.usermanagement.util;

public final class AppConstants {

    public static final String[] PUBLIC_URLS = {
        "/api/auth/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/api-docs/**",
        "/actuator/**"
    };

    public static final String[] SWAGGER_PUBLIC_URLS = {
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/api-docs/**"
    };

    public static final String[] ACTUATOR_PUBLIC_URLS = {
        "/actuator/**"
    };

    public static final String USER_CREATED = "User created successfully";
    public static final String USER_UPDATED = "User updated successfully";
    public static final String USER_DELETED = "User deleted successfully";
    public static final String USER_NOT_FOUND = "User not found with the provided id";
    public static final String USER_ALREADY_EXISTS = "User already exists with this email";
    public static final String USER_PHONE_ALREADY_EXISTS = "Phone number already exists";
    public static final String USER_NOT_FOUND_BY_EMAIL = "User not found with this email";

    public static final String ROLE_CREATED = "Role created successfully";
    public static final String ROLE_UPDATED = "Role updated successfully";
    public static final String ROLE_DELETED = "Role deleted successfully";
    public static final String ROLE_NOT_FOUND = "Role not found with the provided id";
    public static final String ROLE_ALREADY_EXISTS = "Role already exists with this name";

    public static final String AUTH_SUCCESS = "Authentication successful";
    public static final String AUTH_FAILED = "Authentication failed";
    public static final String REGISTER_SUCCESS = "Registration successful";
    public static final String REGISTER_FAILED = "Registration failed";

    public static final String FORGOT_PASSWORD_SUCCESS = "If an account with that email exists, we have sent a password reset link.";
    public static final String RESET_PASSWORD_SUCCESS = "Password reset successfully";
    public static final String INVALID_RESET_TOKEN = "Invalid or expired password reset token";
    public static final String RESET_TOKEN_EXPIRED = "Password reset token has expired. Please request a new one.";

    private AppConstants() {
    }
}