-- V9: Add Community Chat & Real-Time Discussion Support
-- Compatible with MySQL 8.0, PostgreSQL, and H2

-- 1. Community Chat Channels
CREATE TABLE IF NOT EXISTS community_chat_channels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_channels_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_channels_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_chat_channels_community ON community_chat_channels(community_id);

-- 2. Community Messages
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_channel FOREIGN KEY (channel_id) REFERENCES community_chat_channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_parent FOREIGN KEY (parent_message_id) REFERENCES community_messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_channel_created ON community_messages(channel_id, created_at);
CREATE INDEX idx_messages_sender ON community_messages(sender_id);
CREATE INDEX idx_messages_parent ON community_messages(parent_message_id);

-- 3. Community Message Reactions
CREATE TABLE IF NOT EXISTS community_message_reactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reactions_message FOREIGN KEY (message_id) REFERENCES community_messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_message_user_emoji UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX idx_reactions_message ON community_message_reactions(message_id);

-- 4. Community Chat Read Receipts
CREATE TABLE IF NOT EXISTS community_chat_read_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    last_read_message_id BIGINT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipts_channel FOREIGN KEY (channel_id) REFERENCES community_chat_channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_receipts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_channel_user_receipt UNIQUE (channel_id, user_id)
);

CREATE INDEX idx_receipts_channel_user ON community_chat_read_receipts(channel_id, user_id);
