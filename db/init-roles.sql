CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

INSERT INTO roles (id, name, description, created_at)
VALUES
    (UUID(), 'ROLE_ADMIN', 'System administrator with full access privileges', CURRENT_TIMESTAMP),
    (UUID(), 'ROLE_USER', 'Standard authenticated user', CURRENT_TIMESTAMP),
    (UUID(), 'ROLE_MANAGER', 'Manager with limited administrative privileges', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;