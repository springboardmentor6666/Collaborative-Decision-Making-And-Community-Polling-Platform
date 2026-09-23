-- ============================================================
-- DECISIONHUB FLYWAY MIGRATION (V3__add_results_published.sql)
-- Create Election / Voting Event System Schema
-- ============================================================

-- 1. VOTING_EVENT Table
CREATE TABLE IF NOT EXISTS voting_event (
    event_id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    voting_type VARCHAR(20) NOT NULL DEFAULT 'SINGLE',
    anonymous_voting BOOLEAN NOT NULL DEFAULT FALSE,
    results_visible VARCHAR(50) NOT NULL DEFAULT 'RESULTS_HIDDEN_DURING_VOTING',
    results_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_voting_event_community ON voting_event(community_id);
CREATE INDEX IF NOT EXISTS idx_voting_event_status ON voting_event(status);

CREATE TRIGGER update_voting_event_updated_at
    BEFORE UPDATE ON voting_event
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. VOTING_CATEGORY Table
CREATE TABLE IF NOT EXISTS voting_category (
    category_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES voting_event(event_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    max_selections INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_voting_category_event ON voting_category(event_id);

CREATE TRIGGER update_voting_category_updated_at
    BEFORE UPDATE ON voting_category
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. NOMINEE Table
CREATE TABLE IF NOT EXISTS nominee (
    nominee_id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES voting_category(category_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    external_url VARCHAR(500),
    submitted_by BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    approved_by BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    nomination_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_nominee_category ON nominee(category_id);

CREATE TRIGGER update_nominee_updated_at
    BEFORE UPDATE ON nominee
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ELECTION_VOTE Table
CREATE TABLE IF NOT EXISTS election_vote (
    vote_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES voting_event(event_id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES voting_category(category_id) ON DELETE CASCADE,
    nominee_id BIGINT NOT NULL REFERENCES nominee(nominee_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_election_vote_user_category UNIQUE (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_election_vote_user ON election_vote(user_id);
CREATE INDEX IF NOT EXISTS idx_election_vote_event ON election_vote(event_id);
CREATE INDEX IF NOT EXISTS idx_election_vote_category ON election_vote(category_id);
CREATE INDEX IF NOT EXISTS idx_election_vote_nominee ON election_vote(nominee_id);

CREATE TRIGGER update_election_vote_updated_at
    BEFORE UPDATE ON election_vote
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

