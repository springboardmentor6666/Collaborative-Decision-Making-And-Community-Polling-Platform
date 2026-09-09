# DecisionHub — Database Architecture & Schema Specification (`/database`)

The **DecisionHub** persistence layer is engineered around a highly normalized, scalable relational database architecture comprising **35 interconnected tables**. It natively supports **MySQL 8.0** and **PostgreSQL 15+ / Neon Lakebase Cloud Postgres**.

---

## 📁 Directory Layout

```
database/
├── README.md                  # Complete database architecture & entity mapping guide (this file)
├── er-diagram.txt             # Visual ASCII Entity Relationship Diagram & integrity specs
├── schema.sql                 # Complete MySQL 8.0 DDL relational schema definitions
├── schema-postgresql.sql      # PostgreSQL / Neon Lakebase DDL with GIN full-text indexes
└── seed/
    └── sample_data.sql        # Seed dataset (Taxonomy categories, Admin/User accounts, decisions, polls, votes)
```

---

## 🗄️ Relational Schema Catalog (35 Tables)

The database schema is partitioned into 8 functional domain modules:

### 1. Identity, Profiles & Preferences
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 1 | `users` | Core user identity, credentials, role, status | `email` UNIQUE, `role` (USER, MODERATOR, ADMIN), `provider` (LOCAL, GOOGLE) |
| 2 | `user_profiles` | Extended biographical data, avatar links, social handles | `user_id` UNIQUE FK -> `users.id` |
| 3 | `user_interests` | Junction table mapping user interest taxonomy | Composite PK `(user_id, category_id)` |
| 4 | `password_reset_tokens` | Single-use cryptographically signed reset tokens | `token` UNIQUE, `expires_at` |
| 5 | `notification_preferences` | User communication preferences (in-app, email, push) | `UNIQUE(user_id, category)` |

### 2. Categorization & Communities
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 6 | `categories` | Platform topic taxonomy (Career, Technology, Finance, etc.) | `name` UNIQUE, `slug` UNIQUE |
| 7 | `communities` | Interest hubs and collaborative discussion spaces | `name` UNIQUE, `slug` UNIQUE, `created_by` FK -> `users.id` |
| 8 | `community_members` | Community member roster and role assignments | `UNIQUE(community_id, user_id)`, `role` (MEMBER, MODERATOR, ADMIN) |
| 9 | `community_invites` | Invite tokens for joining private communities | `token` UNIQUE, `expires_at`, `status` (PENDING, ACCEPTED, REVOKED) |

### 3. Decisions & Multi-Criteria Decision Analysis (MCDA)
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 10 | `decisions` | Core decision boards created by users | `owner_id` FK -> `users.id`, `category_id` FK, `status` (OPEN, CLOSED), `is_deleted` |
| 11 | `decision_options` | Alternatives evaluated in a decision (e.g. "Option A", "Option B") | `decision_id` FK -> `decisions.id`, `label` |
| 12 | `comparison_factors` | Evaluation criteria (e.g. Cost, Risk, Time, Quality) | `decision_id` FK -> `decisions.id`, `name` |
| 13 | `option_scores` | Weighted 1-10 scores per option per comparison factor | Composite PK `(option_id, factor_id)` |
| 14 | `decision_impressions` | Impression tracking for conversion analytics | `(decision_id, user_id, impression_type, created_at)` |
| 15 | `decision_history` | Audit changelog capturing edits to decision boards | `decision_id` FK, `changed_by` FK |
| 16 | `saved_decisions` | User bookmarking / saved decision boards | `UNIQUE(user_id, decision_id)` |

### 4. Advanced Polling & Ballot Voting (IRV)
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 17 | `polls` | Polling sessions attached to decisions | `decision_id` FK, `poll_type` (SINGLE, MULTI, RATING), `voting_method` |
| 18 | `poll_options` | Junction linking polls to decision options | `UNIQUE(poll_id, option_id)` |
| 19 | `votes` | Cast ballots supporting Single, Approval, and Ranked-Choice | `UNIQUE(poll_id, poll_option_id, voter_id)`, `rank_position`, `weight` |

### 5. Community Chat & Real-Time Messaging
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 20 | `community_chat_channels` | Chat channels within a community (e.g. `#general`, `#announcements`) | `UNIQUE(community_id, name)`, `is_default` |
| 21 | `community_messages` | Threaded chat messages with rich formatting | `channel_id` FK, `sender_id` FK, `parent_message_id` self-FK |
| 22 | `community_message_reactions` | Emoji reactions per chat message per user | `UNIQUE(message_id, user_id, emoji)` |
| 23 | `community_chat_read_receipts` | Channel read markers tracking last viewed message | Composite PK `(channel_id, user_id)`, `last_read_message_id` FK |

### 6. Discussions & Feedback
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 24 | `comments` | Threaded discussion comments on decisions | `decision_id` FK, `author_id` FK, `parent_id` self-referencing FK |
| 25 | `comment_reactions` | Upvotes, downvotes, and hearts on comments | `UNIQUE(comment_id, user_id)` |
| 26 | `suggestions` | User proposals for new options or criteria factors | `decision_id` FK, `suggested_by` FK, `status` (PENDING, ACCEPTED, REJECTED) |
| 27 | `recommendations` | Algorithmic and expert decision recommendations | `decision_id` FK, `recommended_by` FK |

### 7. Polymorphic Activity Feed & Notifications
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 28 | `activities` | Canonical event stream (platform, community, user actions) | Indexed on `(visibility, created_at DESC)`, `(community_id, created_at DESC)` |
| 29 | `notifications` | In-app notification alerts for users | `user_id` FK, `is_read`, `type` |

### 8. Moderation, Governance & Files
| # | Table Name | Description | Key Constraints |
|---|---|---|---|
| 30 | `moderation_flags` | Flagged content queue for moderation review | `target_type` (DECISION, COMMENT, POLL), `target_id`, `status` |
| 31 | `reports` | Formal user violation reports submitted to admins | `reported_by` FK, `status` (PENDING, RESOLVED, DISMISSED) |
| 32 | `audit_logs` | Immutable security audit trail for sensitive administrative events | `actor_id` FK, `action`, `ip_address`, `created_at` |
| 33 | `attachments` | Uploaded files linked to decisions and comments | `file_path`, `file_type`, `file_size`, `uploaded_by` FK |
| 34 | `admin_settings` | Dynamic platform key-value configuration overrides | `setting_key` UNIQUE |
| 35 | `generated_reports` | Generated analytical reports (PDF / CSV export jobs) | `created_by` FK, `status`, `download_url` |

---

## 🔗 Spring Boot JPA Entity Mapping Guide

| Database Table | Java Entity Class | Package | Mapping Details |
|---|---|---|---|
| `users` | `User.java` | `com.decisionhub.entity` | Primary user identity; `@OneToOne` with `UserProfile`, `@OneToMany` with decisions, votes, comments |
| `user_profiles` | `UserProfile.java` | `com.decisionhub.entity` | `@OneToOne` joined via `user_id` foreign key |
| `categories` | `Category.java` | `com.decisionhub.entity` | Lookup entity; referenced by `Decision`, `Community`, and user interest lists |
| `communities` | `Community.java` | `com.decisionhub.entity` | Joined to `Category` and creator `User`; has members, channels |
| `community_members` | `CommunityMember.java` | `com.decisionhub.entity` | Composite uniqueness `(community_id, user_id)` with role enum |
| `community_chat_channels`| `CommunityChatChannel.java`| `com.decisionhub.entity` | Lazy-loaded collection under `Community` |
| `community_messages` | `CommunityMessage.java` | `com.decisionhub.entity` | Self-referencing `@ManyToOne` for threaded replies; soft-delete support |
| `community_message_reactions`| `CommunityMessageReaction.java`| `com.decisionhub.entity`| Unique constraint `(message_id, user_id, emoji)` |
| `community_chat_read_receipts`| `CommunityChatReadReceipt.java`| `com.decisionhub.entity`| `@EmbeddedId` composite key `(channel_id, user_id)` |
| `decisions` | `Decision.java` | `com.decisionhub.entity` | Core decision entity; `@ManyToOne` owner, `@OneToMany` options, factors, comments, polls |
| `decision_options` | `DecisionOption.java` | `com.decisionhub.entity` | Children of `Decision`; cascades with decision lifecycle |
| `comparison_factors` | `ComparisonFactor.java` | `com.decisionhub.entity` | Evaluation criteria belonging to `Decision` |
| `option_scores` | `OptionScore.java` | `com.decisionhub.entity` | Junction score mapping `DecisionOption` x `ComparisonFactor` |
| `polls` | `Poll.java` | `com.decisionhub.entity` | Polling entity linked to `Decision`; configured voting methods |
| `poll_options` | `PollOption.java` | `com.decisionhub.entity` | Links `Poll` to `DecisionOption` |
| `votes` | `Vote.java` | `com.decisionhub.entity` | Ballot entity with `rankPosition` (for IRV) and `weight` |
| `comments` | `Comment.java` | `com.decisionhub.entity` | Self-referencing `@ManyToOne parent` for threaded hierarchy; reactions collection |
| `comment_reactions` | `CommentReaction.java` | `com.decisionhub.entity` | Unique constraint `(comment_id, user_id)` for UPVOTE, DOWNVOTE, HEART |
| `activities` | `Activity.java` | `com.decisionhub.entity` | Polymorphic event feed entity recording global, community, and user actions |
| `notifications` | `Notification.java` | `com.decisionhub.entity` | Alert notifications dispatched to users |
| `moderation_flags` | `ModerationFlag.java` | `com.decisionhub.entity` | Content flags reviewed by moderation queue |
| `reports` | `Report.java` | `com.decisionhub.entity` | Abuse reports handled by platform admins |
| `audit_logs` | `AuditLog.java` | `com.decisionhub.entity` | Append-only administrative action audit log |
| `admin_settings` | `AdminSetting.java` | `com.decisionhub.entity` | Key-value application configuration store |

---

## 🔍 Search Engine Architecture

### MySQL 8.0 Implementation
Uses native **FULLTEXT** indexes in `database/schema.sql`:
- `FULLTEXT INDEX idx_ft_decisions (title, description)`
- `FULLTEXT INDEX idx_ft_communities (name, description)`
- `FULLTEXT INDEX idx_ft_comments (content)`

Queries leverage `BOOLEAN MODE`:
```sql
SELECT id, title, MATCH(title, description) AGAINST(:term IN BOOLEAN MODE) AS score
FROM decisions
WHERE MATCH(title, description) AGAINST(:term IN BOOLEAN MODE) AND is_deleted = FALSE;
```

### PostgreSQL / Neon Implementation
Uses native **Generalized Inverted Indexes (GIN)** with `tsvector`:
- `CREATE INDEX idx_decisions_fts ON decisions USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));`
- `CREATE INDEX idx_communities_fts ON communities USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));`

Queries leverage `@@ plainto_tsquery`:
```sql
SELECT id, title
FROM decisions
WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', :term)
  AND is_deleted = FALSE;
```

---

## 🗳️ Voting & Instant Runoff (IRV) Data Design

The platform supports 5 voting models:
1. **Single Choice**: 1 vote per voter (`poll_option_id`).
2. **Multiple Choice / Approval**: Multiple ballots per voter up to `max_choices`.
3. **Ranked Choice (IRV - Instant Runoff Voting)**:
   - Voters rank preferences via `rank_position` (1 = 1st preference, 2 = 2nd preference).
   - Ballots stored as separate rows in `votes` with `rank_position` ordered.
   - Elimination rounds iteratively eliminate candidate with lowest #1 votes and transfer to next valid preference.
4. **Weighted Voting**: `weight` column in `votes` scales ballot influence.
5. **5-Star Rating**: Rating scores stored in `votes.rating` (1 to 5).

---

## ⚡ Real-Time Chat & Unread Markers

1. **Cursor-Based Pagination**:
   - Indexed via `idx_comm_msgs_channel_created (channel_id, created_at DESC)`.
   - Fetches 50 messages before a given timestamp without table scanning.
2. **Soft Deletes**:
   - Deleting a message sets `is_deleted = TRUE`, preserving threaded reply integrity.
3. **Unread Badge Calculation**:
   - Tracked using `community_chat_read_receipts (channel_id, user_id, last_read_message_id)`.
   - Unread query:
     ```sql
     SELECT COUNT(m.id) FROM community_messages m
     WHERE m.channel_id = :channelId AND m.id > :lastReadMessageId;
     ```

---

## 🚀 Initialization & Migration

### Option 1: Docker Compose (MySQL 8.0)
The MySQL container automatically mounts `database/schema.sql` and `database/seed/sample_data.sql` inside `/docker-entrypoint-initdb.d/`.
```bash
docker compose up -d mysql
```

### Option 2: PostgreSQL (Neon Cloud)
Apply schema directly via `psql` or the Neon Console SQL Editor:
```bash
psql "$DATABASE_URL" -f database/schema-postgresql.sql
```

### Seed Accounts (Password: `Pass123` across all accounts)
- **Admin**: `admin@decisionhub.com`
- **Moderator**: `sarah@decisionhub.com`
- **Standard Users**: `alex@example.com`, `testuser@example.com`, `demo@example.com`, `alice@example.com`
