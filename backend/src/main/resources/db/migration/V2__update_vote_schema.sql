-- Drop the option_id and rating columns from the vote table as they have been moved to vote_selection
ALTER TABLE vote DROP COLUMN IF EXISTS option_id CASCADE;
ALTER TABLE vote DROP COLUMN IF EXISTS rating;

-- Explicitly create the vote_selection table if it hasn't been created by Hibernate
CREATE TABLE IF NOT EXISTS vote_selection (
    selection_id BIGSERIAL PRIMARY KEY,
    vote_id BIGINT NOT NULL REFERENCES vote(vote_id) ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES option(option_id) ON DELETE CASCADE,
    rating INT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_vote_selection_vote ON vote_selection(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_selection_option ON vote_selection(option_id);
