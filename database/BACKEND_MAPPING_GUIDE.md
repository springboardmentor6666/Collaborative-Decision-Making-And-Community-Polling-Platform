# DecisionHub — Database to Backend Mapping Guide

> **For Backend Developers**: Use this document to map Spring Boot JPA `@Entity` classes to the database tables.

---

## Table → Entity Mapping

| # | DB Table | Java Entity Class | Notes |
|---|---|---|---|
| 1 | `users` | `User.java` | `email` is UNIQUE, `role` = USER / MODERATOR / ADMIN |
| 2 | `user_profiles` | `UserProfile.java` | `@OneToOne` with `User` via `user_id` (UNIQUE) |
| 3 | `categories` | `Category.java` | Lookup table, used by decisions, communities, user_interests |
| 4 | `user_interests` | — | Junction table: `@ManyToMany` between `User` ↔ `Category` |
| 5 | `communities` | `Community.java` | `created_by` → FK to `users.id` |
| 6 | `community_members` | `CommunityMember.java` | `UNIQUE(community_id, user_id)`, has `role` column |
| 7 | `decisions` | `Decision.java` | `owner_id` → FK to `users.id`, `is_deleted` for soft delete |
| 8 | `decision_options` | `DecisionOption.java` | `label` = option name (e.g. "MBA", "Job") |
| 9 | `comparison_factors` | `ComparisonFactor.java` | User-defined criteria per decision (Cost, Risk, Time, etc.) |
| 10 | `option_scores` | `OptionScore.java` | Score 1-10 per option per factor |
| 11 | `polls` | `Poll.java` | `poll_type` = SINGLE / MULTI / RATING |
| 12 | `poll_options` | `PollOption.java` | Links `polls` ↔ `decision_options` |
| 13 | `votes` | `Vote.java` | `UNIQUE(poll_id, voter_id)` prevents duplicates |
| 14 | `comments` | `Comment.java` | `parent_id` → self-referencing FK for threaded replies |
| 15 | `notifications` | `Notification.java` | `type` = NEW_COMMENT / NEW_VOTE / etc. |
| 16 | `moderation_flags` | `ModerationFlag.java` | `target_type` = COMMENT / DECISION |
| 17 | `decision_impressions` | `DecisionImpression.java` | Impression tracking (`VIEW`, `SHARE`, etc.) |
| 18 | `suggestions` | `Suggestion.java` | User suggestions for options/factors |
| 19 | `recommendations` | `Recommendation.java` | Algorithmic or expert decision recommendations |
| 20 | `community_invites` | `CommunityInvite.java` | Community invitation tokens & statuses |
| 21 | `saved_decisions` | `SavedDecision.java` | User bookmarked decisions |
| 22 | `attachments` | `Attachment.java` | Decision/comment file uploads & S3/CDN URLs |
| 23 | `audit_logs` | `AuditLog.java` | Administrative & security audit trails |
| 24 | `reports` | `Report.java` | User content moderation reports |
| 25 | `admin_settings` | `AdminSetting.java` | Key-value application configurations |
| 26 | `generated_reports` | `GeneratedReport.java` | Export jobs (PDF/CSV analytics) |
| 27 | `decision_history` | `DecisionHistory.java` | Audit changelog for decisions |
| 28 | `community_chat_channels` | `CommunityChatChannel.java` | Live chat channels per community (`is_default` for `#general`) |
| 29 | `community_messages` | `CommunityMessage.java` | Rich chat messages, threaded replies, pinning & soft-deletes |
| 30 | `community_message_reactions` | `CommunityMessageReaction.java` | Emoji reactions per message per user (`UNIQUE(message_id, user_id, emoji)`) |
| 31 | `community_chat_read_receipts` | `CommunityChatReadReceipt.java` | Composite PK `(channel_id, user_id)` cursor tracking unread messages |


---

## Column Mappings Per Entity

### 1. User.java ← `users`
```
id              → Long id              @Id @GeneratedValue
email           → String email         @Column(unique = true, nullable = false)
password_hash   → String passwordHash  (BCrypt encoded)
full_name       → String fullName
role            → String role          ("USER" / "MODERATOR" / "ADMIN")
provider        → String provider      ("LOCAL" / "GOOGLE")
created_at      → LocalDateTime createdAt
is_active       → Boolean isActive
```

### 2. UserProfile.java ← `user_profiles`
```
id              → Long id              @Id @GeneratedValue
user_id         → User user            @OneToOne @JoinColumn(name = "user_id")
bio             → String bio
avatar_url      → String avatarUrl
```

### 3. Decision.java ← `decisions`
```
id              → Long id              @Id @GeneratedValue
owner_id        → User owner           @ManyToOne @JoinColumn(name = "owner_id")
title           → String title         @Column(nullable = false)
description     → String description
visibility      → String visibility    ("PUBLIC" / "PRIVATE")
category_id     → Category category    @ManyToOne @JoinColumn(name = "category_id")
created_at      → LocalDateTime createdAt
is_deleted      → Boolean isDeleted    (soft delete flag)
```

### 4. DecisionOption.java ← `decision_options`
```
id              → Long id              @Id @GeneratedValue
decision_id     → Decision decision    @ManyToOne @JoinColumn(name = "decision_id")
label           → String label         (e.g. "MBA", "Job", "iPhone 15 Pro")
description     → String description
```

### 5. ComparisonFactor.java ← `comparison_factors`
```
id              → Long id              @Id @GeneratedValue
decision_id     → Decision decision    @ManyToOne @JoinColumn(name = "decision_id")
name            → String name          (e.g. "Cost", "Risk", "Time")
```

### 6. OptionScore.java ← `option_scores`
```
id              → Long id              @Id @GeneratedValue
option_id       → DecisionOption option @ManyToOne @JoinColumn(name = "option_id")
factor_id       → ComparisonFactor factor @ManyToOne @JoinColumn(name = "factor_id")
score           → Integer score        (1 to 10)
```

### 7. Poll.java ← `polls`
```
id              → Long id              @Id @GeneratedValue
decision_id     → Decision decision    @ManyToOne @JoinColumn(name = "decision_id")
poll_type       → String pollType      ("SINGLE" / "MULTI" / "RATING")
is_anonymous    → Boolean isAnonymous
ends_at         → LocalDateTime endsAt
```

### 8. PollOption.java ← `poll_options`
```
id              → Long id              @Id @GeneratedValue
poll_id         → Poll poll            @ManyToOne @JoinColumn(name = "poll_id")
option_id       → DecisionOption option @ManyToOne @JoinColumn(name = "option_id")
```

### 9. Vote.java ← `votes`
```
id              → Long id              @Id @GeneratedValue
poll_id         → Poll poll            @ManyToOne @JoinColumn(name = "poll_id")
poll_option_id  → PollOption pollOption @ManyToOne @JoinColumn(name = "poll_option_id")
voter_id        → User voter           @ManyToOne @JoinColumn(name = "voter_id") (nullable if anonymous)
rating          → Integer rating       (only for RATING polls, 1-5)
voted_at        → LocalDateTime votedAt

Constraint: @Table(uniqueConstraints = @UniqueConstraint(columnNames = {"poll_id", "voter_id"}))
```

### 10. Comment.java ← `comments`
```
id              → Long id              @Id @GeneratedValue
decision_id     → Decision decision    @ManyToOne @JoinColumn(name = "decision_id")
author_id       → User author          @ManyToOne @JoinColumn(name = "author_id")
parent_id       → Comment parent       @ManyToOne @JoinColumn(name = "parent_id") (self-referencing, nullable)
content         → String content       @Column(length = 2000)
created_at      → LocalDateTime createdAt
is_flagged      → Boolean isFlagged
```

### 11. Community.java ← `communities`
```
id              → Long id              @Id @GeneratedValue
name            → String name          @Column(unique = true)
category_id     → Category category    @ManyToOne @JoinColumn(name = "category_id")
description     → String description
created_by      → User createdBy       @ManyToOne @JoinColumn(name = "created_by")
```

### 12. CommunityMember.java ← `community_members`
```
id              → Long id              @Id @GeneratedValue
community_id    → Community community  @ManyToOne @JoinColumn(name = "community_id")
user_id         → User user            @ManyToOne @JoinColumn(name = "user_id")
role            → String role          ("MEMBER" / "MODERATOR")

Constraint: @Table(uniqueConstraints = @UniqueConstraint(columnNames = {"community_id", "user_id"}))
```

### 13. Notification.java ← `notifications`
```
id              → Long id              @Id @GeneratedValue
user_id         → User user            @ManyToOne @JoinColumn(name = "user_id")
type            → String type          ("NEW_COMMENT" / "NEW_VOTE" / etc.)
message         → String message
is_read         → Boolean isRead
created_at      → LocalDateTime createdAt
```

### 14. ModerationFlag.java ← `moderation_flags`
```
id              → Long id              @Id @GeneratedValue
target_type     → String targetType    ("COMMENT" / "DECISION")
target_id       → Long targetId
reported_by     → User reportedBy      @ManyToOne @JoinColumn(name = "reported_by")
reason          → String reason
status          → String status        ("PENDING" / "RESOLVED")
```

### 15. CommunityChatChannel.java ← `community_chat_channels`
```
id              → Long id                           @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
community_id    → Community community               @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "community_id", nullable = false)
name            → String name                       @Column(length = 50, nullable = false)
description     → String description                @Column(length = 255)
is_default      → Boolean isDefault                 @Column(name = "is_default") DEFAULT FALSE
created_by      → User createdBy                    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by", nullable = false)
created_at      → LocalDateTime createdAt           @CreationTimestamp
messages        → List<CommunityMessage> messages   @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL)

Constraint: @Table(name = "community_chat_channels", uniqueConstraints = @UniqueConstraint(name = "uk_community_channel", columnNames = {"community_id", "name"}))
```

### 16. CommunityMessage.java ← `community_messages`
```
id                → Long id                               @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
channel_id        → CommunityChatChannel channel          @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "channel_id", nullable = false)
sender_id         → User sender                           @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sender_id", nullable = false)
parent_message_id → CommunityMessage parentMessage        @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_message_id")
content           → String content                        @Column(columnDefinition = "TEXT", nullable = false)
message_type      → MessageType messageType               @Enumerated(EnumType.STRING) @Column(name = "message_type", length = 20) ("TEXT", "IMAGE", "FILE", "SYSTEM", "POLL_SHARE")
is_pinned         → Boolean isPinned                      @Column(name = "is_pinned") DEFAULT FALSE
is_edited         → Boolean isEdited                      @Column(name = "is_edited") DEFAULT FALSE
is_deleted        → Boolean isDeleted                     @Column(name = "is_deleted") DEFAULT FALSE (soft delete to preserve thread hierarchy)
created_at        → LocalDateTime createdAt               @CreationTimestamp
updated_at        → LocalDateTime updatedAt               @UpdateTimestamp
replies           → List<CommunityMessage> replies        @OneToMany(mappedBy = "parentMessage")
reactions         → List<CommunityMessageReaction> reactions @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)

Indexes: 
- (channel_id, created_at DESC) for cursor-based chat pagination
- (channel_id, is_pinned) for fast retrieval of pinned announcements
- (sender_id) for user message history
```

### 17. CommunityMessageReaction.java ← `community_message_reactions`
```
id              → Long id                               @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
message_id      → CommunityMessage message              @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "message_id", nullable = false)
user_id         → User user                             @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
emoji           → String emoji                          @Column(length = 32, nullable = false) (e.g. "👍", "❤️", "🚀", "💡")
created_at      → LocalDateTime createdAt               @CreationTimestamp

Constraint: @Table(name = "community_message_reactions", uniqueConstraints = @UniqueConstraint(name = "uk_user_message_reaction", columnNames = {"message_id", "user_id", "emoji"}))
```

### 18. CommunityChatReadReceipt.java ← `community_chat_read_receipts`
```
channelId       → Long channelId                        @EmbeddedId / Composite Key (channel_id, user_id)
userId          → Long userId                           
channel         → CommunityChatChannel channel          @MapsId("channelId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "channel_id")
user            → User user                             @MapsId("userId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id")
lastReadMessage → CommunityMessage lastReadMessage      @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "last_read_message_id", nullable = false)
lastReadAt      → LocalDateTime lastReadAt              @UpdateTimestamp

Query Usage: Unread badge calculations via `COUNT(m.id) WHERE m.channel_id = :channelId AND m.id > :lastReadMessageId`
```

---

## Relationship Summary for JPA

```
User        @OneToOne   → UserProfile
User        @ManyToMany → Category       (via user_interests junction table)
User        @OneToMany  → Decision, Vote, Comment, Notification, ModerationFlag, CommunityMessage, CommunityMessageReaction
User        @OneToMany  → CommunityChatChannel (as creator), CommunityChatReadReceipt

Decision    @ManyToOne  → User (owner), Category
Decision    @OneToMany  → DecisionOption, ComparisonFactor, Poll, Comment

DecisionOption @ManyToOne → Decision
DecisionOption @OneToMany → OptionScore, PollOption

Poll        @ManyToOne  → Decision
Poll        @OneToMany  → PollOption, Vote

Vote        @ManyToOne  → Poll, PollOption, User
            UNIQUE(poll_id, voter_id) — prevents duplicate votes

Comment     @ManyToOne  → Decision, User, Comment(parent) — self-referencing

Community   @ManyToMany → User (via community_members)
Community   @OneToMany  → CommunityChatChannel (e.g. #general, #announcements)

CommunityChatChannel @ManyToOne → Community, User (creator)
CommunityChatChannel @OneToMany → CommunityMessage, CommunityChatReadReceipt

CommunityMessage     @ManyToOne → CommunityChatChannel, User (sender), CommunityMessage (parent for replies)
CommunityMessage     @OneToMany → CommunityMessage (replies), CommunityMessageReaction (emoji reactions)

CommunityMessageReaction @ManyToOne → CommunityMessage, User
            UNIQUE(message_id, user_id, emoji) — prevents duplicate emoji reactions

CommunityChatReadReceipt @EmbeddedId (channel_id, user_id)
                         @ManyToOne → CommunityChatChannel, User, CommunityMessage (last_read)
```

---

## Real-Time & Chat Architectural Guidelines

1. **Cursor-Based Pagination**:
   - For channel chat timelines, use cursor pagination ordering by `id DESC` or `created_at DESC` with `LIMIT 50`.
   - Covered by index `idx_comm_msgs_channel_created (channel_id, created_at DESC)`.
2. **Threaded Replies & Soft Deletes**:
   - When a parent message is deleted, mark `is_deleted = TRUE` rather than hard deletion to preserve thread hierarchy and reply readability.
   - Self-referencing FK `parent_message_id` uses `ON DELETE SET NULL` as a safety mechanism.
3. **Optimistic Emoji Reactions**:
   - `UNIQUE(message_id, user_id, emoji)` allows toggling reactions (INSERT on toggle on, DELETE on toggle off) without duplicates or race conditions.
4. **WebSocket / STOMP Real-Time Integration**:
   - Clients subscribe to `/topic/community.{communityId}.channel.{channelId}` for incoming messages and reactions.
   - Read receipt updates can be throttled or debounced and broadcast to `/topic/community.{communityId}.channel.{channelId}.reads`.


---

## Transaction Requirements

1. **Create Decision + Options**: Wrap in `@Transactional` so if option creation fails, the decision is rolled back.
2. **Cast Vote**: Wrap in `@Transactional` with `UNIQUE(poll_id, voter_id)` constraint check to prevent race-condition duplicate votes.

---

## Connection Details (Docker)

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `3306` |
| Database | `myapp_db` |
| Username | `root` / `myapp_user` |
| Password | `rootpass` / `myapp_pass` |
| JDBC URL | `jdbc:mysql://mysql:3306/myapp_db` (inside Docker) |
