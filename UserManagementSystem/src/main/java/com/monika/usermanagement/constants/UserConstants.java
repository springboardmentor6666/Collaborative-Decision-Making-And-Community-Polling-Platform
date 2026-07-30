package com.monika.usermanagement.constants;

public final class UserConstants {

    public static final String USER_CREATED = "User created successfully";
    public static final String USER_UPDATED = "User updated successfully";
    public static final String USER_DELETED = "User deleted successfully";
    public static final String USER_NOT_FOUND = "User not found with the provided id";
    public static final String USER_ALREADY_EXISTS = "User already exists with this email";
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

    public static final String DEFAULT_USER_ROLE = "ROLE_USER";
    public static final String DEFAULT_ADMIN_ROLE = "ROLE_ADMIN";

    public static final int TOKEN_EXPIRATION_MS = 86400000;

    private UserConstants() {
    }
}