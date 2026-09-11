-- Purge any soft-deleted hikes so that users can freely re-hike without duplicate key conflicts
DELETE FROM decision_hike WHERE deleted = true;
