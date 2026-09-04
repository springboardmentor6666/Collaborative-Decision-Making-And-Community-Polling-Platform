-- V9: Add Community Live Chat Channels, Messages, Reactions, and Read Receipts
-- Compatible with MySQL 8.0

-- 1. community_chat_channels
CREATE TABLE IF NOT EXISTS community_chat_channels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_community_channel UNIQUE (community_id, name),
    CONSTRAINT fk_chat_channels_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_channels_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. community_messages
CREATE TABLE IF NOT EXISTS community_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    parent_message_id BIGINT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comm_messages_channel FOREIGN KEY (channel_id) REFERENCES community_chat_channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_messages_parent FOREIGN KEY (parent_message_id) REFERENCES community_messages(id) ON DELETE SET NULL,
    CONSTRAINT chk_comm_messages_type CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'POLL_SHARE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. community_message_reactions
CREATE TABLE IF NOT EXISTS community_message_reactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    emoji VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_message_reaction UNIQUE (message_id, user_id, emoji),
    CONSTRAINT fk_comm_reactions_message FOREIGN KEY (message_id) REFERENCES community_messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. community_chat_read_receipts
CREATE TABLE IF NOT EXISTS community_chat_read_receipts (
    channel_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    last_read_message_id BIGINT NOT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id),
    CONSTRAINT fk_comm_read_receipts_channel FOREIGN KEY (channel_id) REFERENCES community_chat_channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_read_receipts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_read_receipts_message FOREIGN KEY (last_read_message_id) REFERENCES community_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance Indexing & Query Optimizations
CREATE INDEX idx_comm_msgs_channel_created ON community_messages(channel_id, created_at DESC);
CREATE INDEX idx_comm_msgs_sender ON community_messages(sender_id);
CREATE INDEX idx_comm_msgs_pinned ON community_messages(channel_id, is_pinned);
CREATE INDEX idx_comm_reactions_msg ON community_message_reactions(message_id);
CREATE INDEX idx_comm_msgs_parent ON community_messages(parent_message_id);
CREATE INDEX idx_comm_read_receipts_user ON community_chat_read_receipts(user_id);

-- Backfill: Automatically provision a #general default channel for existing communities
INSERT INTO community_chat_channels (community_id, name, description, is_default, created_by)
SELECT c.id, 'general', 'General discussions', TRUE, COALESCE(c.created_by, 1)
FROM communities c
WHERE NOT EXISTS (
    SELECT 1 FROM community_chat_channels ch
    WHERE ch.community_id = c.id AND ch.name = 'general'
);
