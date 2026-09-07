# DecisionHub — Engineering Team Implementation Prompts
## 3×3 Engineering Execution Matrix for Full-Stack Feature Delivery

> **Platform**: DecisionHub — Collaborative Decision-Making & Community Polling Platform  
> **Repository Branch**: `team-one`  
> **Target Audience**: Database Architects (DB), Backend Engineers (BE), Frontend Engineers (FE)  
> **Output Specification**: 9 Independent, Comprehensive, Production-Grade Prompts (3 Roles × 3 Features)

---

## 📑 Table of Contents

1. [System Architecture & Baseline Context](#1-system-architecture--baseline-context)
2. [Prompt Matrix Index](#2-prompt-matrix-index)
3. [FEATURE 1: Community Discussion / Chat Feature](#3-feature-1-community-discussion--chat-feature)
   - [Prompt 1.1: Database Architect (DB)](#prompt-11-database-architect-db--community-discussion--chat)
   - [Prompt 1.2: Backend Engineer (BE)](#prompt-12-backend-engineer-be--community-discussion--chat)
   - [Prompt 1.3: Frontend Engineer (FE)](#prompt-13-frontend-engineer-fe--community-discussion--chat)
4. [FEATURE 2: Recent Activity Feature](#4-feature-2-recent-activity-feature)
   - [Prompt 2.1: Database Architect (DB)](#prompt-21-database-architect-db--recent-activity-feature)
   - [Prompt 2.2: Backend Engineer (BE)](#prompt-22-backend-engineer-be--recent-activity-feature)
   - [Prompt 2.3: Frontend Engineer (FE)](#prompt-23-frontend-engineer-fe--recent-activity-feature)
5. [FEATURE 3: Enhancement of All Existing Features](#5-feature-3-enhancement-of-all-existing-features)
   - [Prompt 3.1: Database Architect (DB)](#prompt-31-database-architect-db--enhancement-of-existing-features)
   - [Prompt 3.2: Backend Engineer (BE)](#prompt-32-backend-engineer-be--enhancement-of-existing-features)
   - [Prompt 3.3: Frontend Engineer (FE)](#prompt-33-frontend-engineer-fe--enhancement-of-existing-features)
6. [Cross-Functional Team Integration & Hand-off Matrix](#6-cross-functional-team-integration--hand-off-matrix)

---

## 1. System Architecture & Baseline Context

DecisionHub is an enterprise-grade collaborative decision-making platform built according to Infosys Springboard specifications. The current application is fully containerized and features:

- **Database Layer**: MySQL 8.0 / PostgreSQL (DDL normalized to 3NF, Flyway migrations `V1` to `V8`, 27 tables including `users`, `communities`, `community_members`, `decisions`, `decision_options`, `polls`, `votes`, `comments`, `suggestions`, `recommendations`, `notifications`, `audit_logs`, `decision_history`).
- **Backend Layer**: Java 17, Spring Boot 3.3.2, Spring Security 6 (Stateless JWT HMAC-SHA256, RBAC: `USER`, `MODERATOR`, `ADMIN`), Spring Data JPA, Hibernate ORM, Caffeine caching, Firebase Admin, Cloudinary file storage, Maven build.
- **Frontend Layer**: React 19, Vite 5, Tailwind CSS 3.4, React Router 6, Axios (`axiosClient.js`), Framer Motion 12, Lucide React icons, JSPDF, Glassmorphism theme system (`useTheme` with light/dark modes and accent palettes: Black, Green, Saffron, Royal).

---

## 2. Prompt Matrix Index

| Feature | Database Prompt (DB) | Backend Prompt (BE) | Frontend Prompt (FE) |
|---|---|---|---|
| **1. Community Discussion / Chat** | [Prompt 1.1](#prompt-11-database-architect-db--community-discussion--chat) | [Prompt 1.2](#prompt-12-backend-engineer-be--community-discussion--chat) | [Prompt 1.3](#prompt-13-frontend-engineer-fe--community-discussion--chat) |
| **2. Recent Activity Stream** | [Prompt 2.1](#prompt-21-database-architect-db--recent-activity-feature) | [Prompt 2.2](#prompt-22-backend-engineer-be--recent-activity-feature) | [Prompt 2.3](#prompt-23-frontend-engineer-fe--recent-activity-feature) |
| **3. Enhancement of Existing Features** | [Prompt 3.1](#prompt-31-database-architect-db--enhancement-of-existing-features) | [Prompt 3.2](#prompt-32-backend-engineer-be--enhancement-of-existing-features) | [Prompt 3.3](#prompt-33-frontend-engineer-fe--enhancement-of-existing-features) |

---

## 3. FEATURE 1: Community Discussion / Chat Feature

### Prompt 1.1: Database Architect (DB) — Community Discussion / Chat

```text
ROLE: Senior Database Architect & Schema Engineer
PROJECT: DecisionHub (Branch: team-one)
DATABASE STACK: MySQL 8.0 / PostgreSQL | Flyway Migration Framework
CONTEXT:
The platform currently supports decision-level threaded comments (`comments` table) tied to individual decision boards (`decision_id`), but communities (`communities` table, `community_members` table) completely lack dedicated real-time chat, topic channels, and member discussion rooms.
You must design a robust, 3NF-compliant relational schema to support community-wide live chat channels, rich messages, threaded replies, emoji reactions, pinned messages, and read receipts.

OBJECTIVE:
Author the complete Flyway migration script `V9__add_community_chat.sql` for MySQL (and provide the PostgreSQL equivalent) along with updates to `database/schema.sql` and `database/BACKEND_MAPPING_GUIDE.md`.

TECHNICAL SPECIFICATIONS:
1. Tables to Design & Create:
   a. `community_chat_channels`:
      - `id` BIGINT AUTO_INCREMENT PRIMARY KEY
      - `community_id` BIGINT NOT NULL (FK -> `communities(id)` ON DELETE CASCADE)
      - `name` VARCHAR(50) NOT NULL (e.g., "general", "announcements", "q-and-a")
      - `description` VARCHAR(255) NULL
      - `is_default` BOOLEAN DEFAULT FALSE (one default channel per community)
      - `created_by` BIGINT NOT NULL (FK -> `users(id)` ON DELETE CASCADE)
      - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - UNIQUE KEY `uk_community_channel` (`community_id`, `name`)

   b. `community_messages`:
      - `id` BIGINT AUTO_INCREMENT PRIMARY KEY
      - `channel_id` BIGINT NOT NULL (FK -> `community_chat_channels(id)` ON DELETE CASCADE)
      - `sender_id` BIGINT NOT NULL (FK -> `users(id)` ON DELETE CASCADE)
      - `parent_message_id` BIGINT NULL (Self-referencing FK -> `community_messages(id)` ON DELETE SET NULL for threaded replies)
      - `content` TEXT NOT NULL (Max 4000 chars)
      - `message_type` VARCHAR(20) DEFAULT 'TEXT' (CHECK IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'POLL_SHARE'))
      - `is_pinned` BOOLEAN DEFAULT FALSE
      - `is_edited` BOOLEAN DEFAULT FALSE
      - `is_deleted` BOOLEAN DEFAULT FALSE (Soft delete flag to preserve thread tree integrity)
      - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

   c. `community_message_reactions`:
      - `id` BIGINT AUTO_INCREMENT PRIMARY KEY
      - `message_id` BIGINT NOT NULL (FK -> `community_messages(id)` ON DELETE CASCADE)
      - `user_id` BIGINT NOT NULL (FK -> `users(id)` ON DELETE CASCADE)
      - `emoji` VARCHAR(32) NOT NULL (e.g., "👍", "❤️", "🚀", "💡")
      - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      - UNIQUE KEY `uk_user_message_reaction` (`message_id`, `user_id`, `emoji`)

   d. `community_chat_read_receipts`:
      - `channel_id` BIGINT NOT NULL (FK -> `community_chat_channels(id)` ON DELETE CASCADE)
      - `user_id` BIGINT NOT NULL (FK -> `users(id)` ON DELETE CASCADE)
      - `last_read_message_id` BIGINT NOT NULL (FK -> `community_messages(id)` ON DELETE CASCADE)
      - `last_read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      - PRIMARY KEY (`channel_id`, `user_id`)

2. Performance Indexing & Query Optimizations:
   - Index `idx_comm_msgs_channel_created` ON `community_messages(channel_id, created_at DESC)` for cursor-based chat pagination.
   - Index `idx_comm_msgs_sender` ON `community_messages(sender_id)`.
   - Index `idx_comm_msgs_pinned` ON `community_messages(channel_id, is_pinned)` WHERE `is_pinned = TRUE`.
   - Index `idx_comm_reactions_msg` ON `community_message_reactions(message_id)`.

3. Migration & Compatibility Guidelines:
   - Write file `backend/src/main/resources/db/migration/V9__add_community_chat.sql`.
   - Ensure compatibility with MySQL 8.0 and PostgreSQL 15+.
   - Add data backfill script in `V9`: Automatically create a `#general` default channel for all existing communities in the `communities` table (`INSERT INTO community_chat_channels (community_id, name, description, is_default, created_by) SELECT id, 'general', 'General discussions', TRUE, created_by FROM communities;`).

DELIVERABLES:
1. `backend/src/main/resources/db/migration/V9__add_community_chat.sql`
2. `database/schema.sql` (Appended with new DDL blocks and indexes)
3. `database/BACKEND_MAPPING_GUIDE.md` (Updated entity mapping specifications for BE team)
```

---

### Prompt 1.2: Backend Engineer (BE) — Community Discussion / Chat

```text
ROLE: Senior Backend Engineer (Spring Boot 3 / WebSocket / Security)
PROJECT: DecisionHub (Branch: team-one)
TECH STACK: Java 17 | Spring Boot 3.3.2 | Spring WebSocket & STOMP | Spring Security 6 | Spring Data JPA
CONTEXT:
The database team has provided `V9__add_community_chat.sql` adding `community_chat_channels`, `community_messages`, `community_message_reactions`, and `community_chat_read_receipts`.
Currently, DecisionHub only communicates over standard HTTP REST. You must implement a dual-layer communication system:
1. High-throughput WebSocket/STOMP broker for instant real-time message broadcasting, typing indicators, and reactions.
2. Comprehensive REST API for channel management, message history cursor pagination, pinning, search, and file attachments.

OBJECTIVE:
Implement end-to-end backend microservice support for Community Discussions and Real-Time Chat within `com.decisionhub.*`.

TECHNICAL SPECIFICATIONS:
1. Dependencies & WebSocket Configuration:
   - Verify `spring-boot-starter-websocket` in `backend/pom.xml`.
   - Create `com.decisionhub.config.WebSocketConfig` implementing `WebSocketMessageBrokerConfigurer`:
     - Enable SimpleBroker at `/topic` and `/queue`.
     - Set application destination prefix to `/app`.
     - Register STOMP endpoint `/ws-chat` with `.setAllowedOriginPatterns("*")` and SockJS fallback.
   - Create `com.decisionhub.security.WebSocketAuthChannelInterceptor`:
     - Intercept `CONNECT` command.
     - Extract `Authorization: Bearer <jwt>` header from native STOMP headers.
     - Validate JWT using `JwtUtil` and authenticate the `Principal` in `SimpMessageHeaderAccessor`.

2. Entities & Repositories:
   - Create `com.decisionhub.entity.CommunityChatChannel`:
     - Fields: `Long id`, `Community community`, `String name`, `String description`, `Boolean isDefault`, `User createdBy`, `LocalDateTime createdAt`.
   - Create `com.decisionhub.entity.CommunityMessage`:
     - Fields: `Long id`, `CommunityChatChannel channel`, `User sender`, `CommunityMessage parentMessage`, `String content`, `String messageType`, `Boolean isPinned`, `Boolean isEdited`, `Boolean isDeleted`, `LocalDateTime createdAt`, `LocalDateTime updatedAt`.
     - `@OneToMany` relation to `CommunityMessageReaction`.
   - Create `com.decisionhub.entity.CommunityMessageReaction`:
     - Fields: `Long id`, `CommunityMessage message`, `User user`, `String emoji`, `LocalDateTime createdAt`.
   - Repositories in `com.decisionhub.repository`:
     - `CommunityChatChannelRepository`: `findByCommunityId(Long communityId)`, `findByCommunityIdAndIsDefaultTrue(Long communityId)`.
     - `CommunityMessageRepository`: `findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(Long channelId, Pageable pageable)`, `findByChannelIdAndCreatedAtBeforeAndIsDeletedFalseOrderByCreatedAtDesc(Long channelId, LocalDateTime before, Pageable pageable)`, `findByChannelIdAndIsPinnedTrue(Long channelId)`.
     - `CommunityMessageReactionRepository`: `findByMessageId(Long messageId)`, `deleteByMessageIdAndUserIdAndEmoji(...)`.

3. Security & Membership Validation:
   - Enforce RBAC and community privacy:
     - For `PRIVATE` communities, verify via `CommunityMemberRepository.existsByCommunityIdAndUserId(commId, userId)` before allowing channel read, message fetch, or WebSocket room subscription (`/topic/communities/{communityId}/chat/**`).
     - Channel creation and message pinning: Restricted to community `OWNER` or `ADMIN`.

4. DTOs & Validation:
   - `ChatMessageRequest`: `@NotBlank @Size(max=4000) String content`, `String messageType`, `Long parentMessageId`.
   - `ChatMessageResponse`: `Long id`, `Long channelId`, `UserSummaryDto sender`, `String content`, `String messageType`, `Boolean isPinned`, `Boolean isEdited`, `Long parentMessageId`, `Map<String, List<String>> reactions` (emoji -> list of user names), `LocalDateTime createdAt`.
   - `ChatReactionRequest`: `@NotBlank String emoji`.
   - `ChatChannelRequest`: `@NotBlank @Pattern(regexp="^[a-z0-9-]+$") String name`, `String description`.

5. Controllers:
   - REST Controller `com.decisionhub.controller.CommunityChatController` (`/api/communities/{communityId}/chat`):
     - `GET /channels` — List all channels for the community.
     - `POST /channels` — Create new channel (`OWNER`/`ADMIN` only).
     - `GET /channels/{channelId}/messages` — Paginated message history (supports cursor `before` timestamp).
     - `POST /channels/{channelId}/messages` — Send message via HTTP REST (triggers WebSocket broadcast).
     - `PUT /messages/{messageId}` — Edit message (Author only).
     - `DELETE /messages/{messageId}` — Soft delete message (Author or community admin).
     - `POST /messages/{messageId}/react` — Toggle emoji reaction.
     - `PATCH /messages/{messageId}/pin` — Pin/unpin message.
   - STOMP Controller `com.decisionhub.controller.CommunityChatWsController`:
     - `@MessageMapping("/chat.send/{channelId}")` -> validates member, persists message, broadcasts to `/topic/channels/{channelId}`.
     - `@MessageMapping("/chat.typing/{channelId}")` -> broadcasts typing event `{ userId, userName, isTyping }` to `/topic/channels/{channelId}/typing`.

DELIVERABLES:
1. `WebSocketConfig.java`, `WebSocketAuthChannelInterceptor.java`
2. Entities: `CommunityChatChannel.java`, `CommunityMessage.java`, `CommunityMessageReaction.java`
3. Repositories, DTO records, and `CommunityChatService.java`
4. `CommunityChatController.java` & `CommunityChatWsController.java` with complete unit/integration tests (`@SpringBootTest`).
```

---

### Prompt 1.3: Frontend Engineer (FE) — Community Discussion / Chat

```text
ROLE: Senior Frontend Engineer (React 19 / Tailwind CSS / WebSocket Client)
PROJECT: DecisionHub (Branch: team-one)
TECH STACK: React 19 | Vite 5 | Tailwind CSS 3.4 | Axios | Lucide React | Framer Motion
CONTEXT:
In `frontend/src/pages/CommunityDetails.jsx`, users currently have only two tabs: "Decisions" and "Members".
With the new backend WebSocket & REST chat endpoints (`/ws-chat` and `/api/communities/{id}/chat`), you need to build a modern, high-engagement Community Discussion & Chat Room experience styled with DecisionHub's glassmorphism theme system.

OBJECTIVE:
Build a real-time Community Chat & Discussion interface embedded inside `CommunityDetails.jsx` as a new primary tab, along with standalone reusable chat components in `frontend/src/components/chat/`.

TECHNICAL SPECIFICATIONS:
1. Client API & WebSocket Connection:
   - In `frontend/src/api/axiosClient.js`, add helper functions:
     - `getCommunityChannelsApi(communityId, token)`
     - `createCommunityChannelApi(communityId, channelData, token)`
     - `getChannelMessagesApi(communityId, channelId, beforeCursor, token)`
     - `sendChannelMessageApi(communityId, channelId, messageData, token)`
     - `toggleMessageReactionApi(messageId, emoji, token)`
     - `pinMessageApi(messageId, token)`
     - `deleteChatMessageApi(messageId, token)`
   - Implement a robust STOMP/WebSocket hook `frontend/src/hooks/useCommunityChat.js`:
     - Connects to `/ws-chat` using browser WebSocket or SockJS with Bearer token authentication.
     - Subscribes to `/topic/channels/{channelId}` for incoming messages and reactions.
     - Subscribes to `/topic/channels/{channelId}/typing` for typing indicators.
     - Provides automatic exponential-backoff reconnection and a graceful fallback to polling `/api/communities/{id}/chat/channels/{channelId}/messages` every 4 seconds if WebSocket is blocked or disconnected.

2. Component Hierarchy in `frontend/src/components/chat/`:
   - `CommunityChatTab.jsx`: Main container with two-column layout (Channel sidebar on the left, active message stream on the right; collapsable on mobile).
   - `ChatChannelSidebar.jsx`: Displays channel list (`#general`, `#announcements`, etc.), create channel modal button (for owners/admins), unread count badges.
   - `ChatMessageStream.jsx`: Virtualized/infinite-scroll message list with date separators ("Today", "Yesterday"), sticky pinned message banner at the top, auto-scroll with smooth behavior, and floating "↓ New Messages" pill when scrolled up.
   - `ChatMessageItem.jsx`: Shows sender avatar (Dicebear or custom), user role badge (`OWNER`, `ADMIN`, `MEMBER`), formatted timestamp, rendered markdown, threaded reply preview, emoji reaction pills with counters, and hover action bar (Reply, React, Pin, Delete).
   - `ChatComposer.jsx`: Rich message input with emoji picker popup, attachment button, character counter, Enter to send (Shift+Enter for new line), and broadcast typing event debounced to 300ms.
   - `ChatReactionPicker.jsx`: Quick emoji bar (👍, ❤️, 🚀, 💡, 🔥, 😂) with smooth Framer Motion pop-in.

3. Integration in `CommunityDetails.jsx`:
   - Add a 3rd tab: `💬 Discussion & Chat` next to `Decisions` and `Members`.
   - Show lock state if the community is `PRIVATE` and the current user is not a member, with an interactive "Join Community to Participate" banner.
   - Match colors to the current active theme accent (`useTheme()` tokens: Black, Green, Saffron, Royal).

4. UX & Resilience Requirements:
   - Optimistic UI: Immediately render the sent message in pending state; update to confirmed upon WebSocket ACK or HTTP response.
   - Error toast notification if sending fails with a "Retry" button.
   - Keyboard accessible: `Escape` closes emoji picker or reply bar, `ArrowUp` while composer is empty triggers edit mode on last sent message.

DELIVERABLES:
1. `frontend/src/hooks/useCommunityChat.js`
2. Components in `frontend/src/components/chat/` (`CommunityChatTab.jsx`, `ChatMessageStream.jsx`, `ChatMessageItem.jsx`, `ChatComposer.jsx`, `ChatChannelSidebar.jsx`, `ChatReactionPicker.jsx`)
3. Updated `frontend/src/api/axiosClient.js` with all chat endpoints.
4. Updated `frontend/src/pages/CommunityDetails.jsx` integrating the new Discussion & Chat tab seamlessly.
```

---

## 4. FEATURE 2: Recent Activity Feature

### Prompt 2.1: Database Architect (DB) — Recent Activity Feature

```text
ROLE: Senior Database Architect & Schema Engineer
PROJECT: DecisionHub (Branch: team-one)
DATABASE STACK: MySQL 8.0 / PostgreSQL | Flyway Migration Framework
CONTEXT:
Currently, DecisionHub stores fragmented historical events:
- `audit_logs` is restricted to administrative actions (delete user, resolve flag).
- `decision_history` records field-level diffs on decisions.
- `notifications` are private alerts targeted to single users.
There is NO unified, high-performance, public-facing activity timeline for the platform, individual communities, or user profiles.
We must introduce a canonical, polymorphic `activities` table capable of logging and querying cross-platform actions with millisecond latency.

OBJECTIVE:
Create Flyway migration `V10__add_recent_activities.sql`, establish optimized composite indexes, and configure automated data lifecycle management for activity records.

TECHNICAL SPECIFICATIONS:
1. Table Design: `activities`
   - `id` BIGINT AUTO_INCREMENT PRIMARY KEY
   - `actor_id` BIGINT NOT NULL (FK -> `users(id)` ON DELETE CASCADE)
   - `activity_type` VARCHAR(40) NOT NULL:
     * `DECISION_CREATED`: User published a new decision board
     * `DECISION_CLOSED`: Decision was marked closed/finalized
     * `VOTE_CAST`: User voted on a poll option
     * `COMMENT_ADDED`: User commented on a decision
     * `SUGGESTION_SUBMITTED`: User posted a structured suggestion
     * `RECOMMENDATION_ADDED`: Expert added a formal recommendation
     * `COMMUNITY_CREATED`: New community was founded
     * `COMMUNITY_JOINED`: Member joined a community
     * `COMMUNITY_MESSAGE_SENT`: User posted in a community chat
     * `OPTION_ADDED`: New alternative was added to an open decision
   - `entity_type` VARCHAR(30) NOT NULL ('DECISION', 'POLL', 'COMMENT', 'COMMUNITY', 'USER')
   - `entity_id` BIGINT NOT NULL
   - `community_id` BIGINT NULL (FK -> `communities(id)` ON DELETE CASCADE)
   - `title` VARCHAR(255) NOT NULL (Snapshot summary, e.g., "Alex Developer voted on 'MBA vs Job'")
   - `metadata` JSON NULL (For PostgreSQL: `JSONB`; for MySQL: `JSON` or `TEXT` fallback storing `{ "optionLabel": "Job", "category": "Career" }`)
   - `visibility` VARCHAR(15) DEFAULT 'PUBLIC' (CHECK IN ('PUBLIC', 'COMMUNITY_ONLY', 'PRIVATE'))
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. High-Performance Indexing Strategy:
   - Global Activity Feed query:
     `CREATE INDEX idx_activities_global ON activities (visibility, created_at DESC);`
   - Community-Specific Feed query:
     `CREATE INDEX idx_activities_community ON activities (community_id, visibility, created_at DESC);`
   - User Profile Activity query:
     `CREATE INDEX idx_activities_actor ON activities (actor_id, visibility, created_at DESC);`
   - Entity Reference query:
     `CREATE INDEX idx_activities_entity ON activities (entity_type, entity_id);`

3. Seed & Migration Rules:
   - Migration file: `backend/src/main/resources/db/migration/V10__add_recent_activities.sql`.
   - Seed initial recent activities based on existing records in `decisions`, `votes`, `comments`, and `community_members` so the feed is instantly populated upon deployment.
   - Update `database/schema.sql` and `database/BACKEND_MAPPING_GUIDE.md`.

DELIVERABLES:
1. `backend/src/main/resources/db/migration/V10__add_recent_activities.sql`
2. `database/schema.sql` updated with `activities` table & indexes.
3. Documentation entry in `database/BACKEND_MAPPING_GUIDE.md`.
```

---

### Prompt 2.2: Backend Engineer (BE) — Recent Activity Feature

```text
ROLE: Senior Backend Engineer (Spring Boot 3 / Event-Driven Architecture)
PROJECT: DecisionHub (Branch: team-one)
TECH STACK: Java 17 | Spring Boot 3.3.2 | Spring ApplicationEventPublisher | Spring Data JPA | Caffeine Cache
CONTEXT:
Database migration `V10__add_recent_activities.sql` introduces the `activities` table.
To decouple activity logging from core business transactions (such as voting, creating decisions, and submitting comments), you must implement an asynchronous, event-driven activity logging engine using Spring events (`ApplicationEventPublisher`), ensuring zero performance penalty on critical user paths.

OBJECTIVE:
Build the complete Event-Driven Activity Subsystem, JPA repository, service layer with Caffeine caching, and REST endpoints for Global, Community, and User recent activity feeds.

TECHNICAL SPECIFICATIONS:
1. Event System & Asynchronous Dispatcher:
   - Create event class `com.decisionhub.event.ActivityEvent`:
     - Fields: `Long actorId`, `String activityType`, `String entityType`, `Long entityId`, `Long communityId`, `String title`, `Map<String, Object> metadata`, `String visibility`.
   - Create asynchronous listener `com.decisionhub.service.ActivityEventListener`:
     - Annotate listener method with `@Async` and `@EventListener`.
     - Injects `ActivityRepository` and persists the new `Activity` entity safely.
     - Wraps execution in `try-catch` to ensure that any logging failure never rolls back the triggering transaction.
     - Evicts/invalidates Caffeine cache for activity feeds upon new record creation.

2. Instrumentation in Existing Services:
   - Inject `ApplicationEventPublisher` and publish `ActivityEvent` inside:
     - `DecisionService.createDecision()` -> `DECISION_CREATED`
     - `DecisionService.closeDecision()` -> `DECISION_CLOSED`
     - `DecisionService.addOption()` -> `OPTION_ADDED`
     - `VoteService.castVote()` -> `VOTE_CAST`
     - `CommentService.createComment()` -> `COMMENT_ADDED`
     - `CommunityService.createCommunity()` -> `COMMUNITY_CREATED`
     - `CommunityService.joinCommunity()` -> `COMMUNITY_JOINED`

3. Entity & Repository:
   - Create `com.decisionhub.entity.Activity`:
     - Fields mapped to `activities` table.
   - Create `com.decisionhub.repository.ActivityRepository`:
     - `findByVisibilityOrderByCreatedAtDesc(String visibility, Pageable pageable)`
     - `findByCommunityIdAndVisibilityOrderByCreatedAtDesc(Long communityId, String visibility, Pageable pageable)`
     - `findByActorIdAndVisibilityOrderByCreatedAtDesc(Long actorId, String visibility, Pageable pageable)`

4. DTOs & Service:
   - `ActivityResponse`: `Long id`, `UserSummaryDto actor`, `String activityType`, `String entityType`, `Long entityId`, `Long communityId`, `String communityName`, `String title`, `Map<String, Object> metadata`, `LocalDateTime createdAt`.
   - `ActivityService`:
     - `@Cacheable(value = "recentActivities", key = "#pageable.pageNumber")`
     - `Page<ActivityResponse> getGlobalRecentActivities(Pageable pageable, String currentUserEmail)`: filters out private community activities if the requesting user is not a member.
     - `Page<ActivityResponse> getCommunityActivities(Long communityId, Pageable pageable, String currentUserEmail)`.
     - `Page<ActivityResponse> getUserActivities(Long userId, Pageable pageable, String currentUserEmail)`.

5. REST Controller:
   - Create `com.decisionhub.controller.ActivityController` (`/api/activities`):
     - `GET /api/activities/recent` — Global platform activity stream (paginated).
     - `GET /api/activities/communities/{communityId}` — Community-specific activity stream.
     - `GET /api/activities/users/{userId}` — User profile public activity stream.
     - Optional filter params: `?type=DECISION_CREATED,VOTE_CAST` and `?limit=20`.

DELIVERABLES:
1. `Activity.java` entity and `ActivityRepository.java`
2. `ActivityEvent.java` and `ActivityEventListener.java` (with `@Async`)
3. `ActivityService.java` with cache management and DTO transformations.
4. `ActivityController.java` with Swagger API documentation.
5. Injected event publishing calls across `DecisionService`, `VoteService`, `CommentService`, and `CommunityService`.
```

---

### Prompt 2.3: Frontend Engineer (FE) — Recent Activity Feature

```text
ROLE: Senior Frontend Engineer (React 19 / Tailwind CSS / Framer Motion)
PROJECT: DecisionHub (Branch: team-one)
TECH STACK: React 19 | Vite 5 | Tailwind CSS 3.4 | Axios | Lucide React | Framer Motion
CONTEXT:
Backend API now exposes `/api/activities/recent`, `/api/activities/communities/{id}`, and `/api/activities/users/{id}`.
Currently, `DashboardPage.jsx` shows Popular Categories and Decision Trends, but users have no live view of who is voting, creating polls, or participating across the community. Furthermore, `CommunityDetails.jsx` and `Profile.jsx` lack dedicated activity logs.

OBJECTIVE:
Build a polished, highly responsive Recent Activity Stream component system and integrate it into:
1. `DashboardPage.jsx` (Interactive Real-Time Activity Sidebar/Widget)
2. `CommunityDetails.jsx` (New Community Activity Feed Tab)
3. `Profile.jsx` (User's Personal Contribution Timeline)

TECHNICAL SPECIFICATIONS:
1. API Client Integration:
   - In `frontend/src/api/axiosClient.js`, implement:
     - `getRecentActivitiesApi(params, token)`
     - `getCommunityActivitiesApi(communityId, params, token)`
     - `getUserActivitiesApi(userId, params, token)`

2. Components in `frontend/src/components/activity/`:
   - `RecentActivityFeed.jsx`:
     - Props: `feedType` ('GLOBAL' | 'COMMUNITY' | 'USER'), `targetId` (optional), `limit` (default: 15), `showHeader` (boolean).
     - Features:
       * Filter chip pills: `All`, `Decisions`, `Votes`, `Comments`, `Community`.
       * Live polling ticker: Re-fetches activities every 15 seconds (auto-pauses when browser tab is inactive using `document.visibilityState`).
       * Smooth Framer Motion entrance animations (`AnimatePresence`, staggered slide-in).
   - `ActivityItemCard.jsx`:
     - Visual icon badges customized by `activityType`:
       * `VOTE_CAST`: Emerald ballot badge (`CheckCircle2`)
       * `DECISION_CREATED`: Blue spark badge (`PlusCircle`)
       * `COMMENT_ADDED`: Purple speech bubble (`MessageSquare`)
       * `COMMUNITY_JOINED`: Amber users badge (`UserPlus`)
       * `DECISION_CLOSED`: Rose checkmark badge (`CheckSquare`)
     - Clickable link navigating directly to `/decisions/:id` or `/communities/:id`.
     - Displays actor avatar, relative time ("2m ago", "1h ago"), and bold highlight of the entity title.

3. Page Integrations:
   - `DashboardPage.jsx`:
     - Add a dedicated "⚡ Live Platform Activity" feed card in the 3rd column of the dashboard widget grid (or adjacent to trends), giving users immediate real-time pulse of community participation.
   - `CommunityDetails.jsx`:
     - Add an "Activity" tab alongside Decisions, Discussion, and Members, showing everything happening inside that specific community.
   - `Profile.jsx`:
     - Add a "My Activity Timeline" section under the user's profile card showing recent votes, decisions created, and discussions initiated.

4. Design & Interaction Standards:
   - Dark and light theme parity using CSS variables and Tailwind tokens.
   - Glassmorphism borders (`border-border-default bg-surface/80 backdrop-blur-md`).
   - Clean empty state with illustration and "No recent activity yet" guidance.

DELIVERABLES:
1. `frontend/src/components/activity/RecentActivityFeed.jsx`
2. `frontend/src/components/activity/ActivityItemCard.jsx`
3. Updated `frontend/src/api/axiosClient.js`
4. Integrated `DashboardPage.jsx`, `CommunityDetails.jsx`, and `Profile.jsx`.
```

---

## 5. FEATURE 3: Enhancement of All Existing Features

### Prompt 3.1: Database Architect (DB) — Enhancement of Existing Features

```text
ROLE: Principal Database Architect & Performance Tuning Lead
PROJECT: DecisionHub (Branch: team-one)
DATABASE STACK: MySQL 8.0 / PostgreSQL | Flyway Migration Framework
CONTEXT:
A comprehensive audit of the current database schema (`database/schema.sql` and migrations `V1`-`V8`) reveals several critical opportunities for functional expansion and scale:
1. Polling: The `polls` and `votes` tables currently only support basic single-choice voting; ranked-choice (instant runoff) and weighted multi-choice are not represented at the schema level.
2. Search: The database relies on slow SQL `LIKE %search%` queries across `decisions`, `communities`, and `comments`, with no full-text search indexes.
3. Decision Lifecycle: Decisions lack automated expiration triggers (`ends_at` is only in `polls`, not on `decisions`), winner determination fields, and soft-delete cascade integrity.
4. Comment Quality: Comments lack upvoting/downvoting (`comment_votes`) and edit changelogs.
5. Indexing: Several foreign keys and timestamp columns lack composite indexes, degrading query plans under volume.

OBJECTIVE:
Create Flyway migration `V11__enhance_existing_features.sql`, establish full-text indexes, expand polling mechanisms, add comment reputation tables, and implement database-level optimizations.

TECHNICAL SPECIFICATIONS:
1. Polling & Voting Enhancements:
   - Alter table `polls`:
     - `ADD COLUMN voting_method VARCHAR(25) DEFAULT 'SINGLE_CHOICE' AFTER poll_type;` (CHECK IN ('SINGLE_CHOICE', 'APPROVAL', 'RANKED_CHOICE', 'WEIGHTED'))
     - `ADD COLUMN max_choices INT DEFAULT 1;`
     - `ADD COLUMN allow_revoting BOOLEAN DEFAULT FALSE;`
   - Alter table `votes`:
     - `ADD COLUMN rank_position INT NULL;` (For ranked-choice / Borda count tallies)
     - `ADD COLUMN weight DECIMAL(5,2) DEFAULT 1.00;`
     - Update unique constraint: Drop old single-vote unique constraint if revoting or multi-choice is enabled; replace with `UNIQUE KEY uk_poll_option_voter (poll_id, poll_option_id, voter_id)`.

2. Decision Lifecycle & Expiration:
   - Alter table `decisions`:
     - `ADD COLUMN ends_at TIMESTAMP NULL DEFAULT NULL;`
     - `ADD COLUMN auto_close BOOLEAN DEFAULT FALSE;`
     - `ADD COLUMN winning_option_id BIGINT NULL;`
     - `ADD CONSTRAINT fk_decision_winning_option FOREIGN KEY (winning_option_id) REFERENCES decision_options(id) ON DELETE SET NULL;`
     - `ADD COLUMN view_count BIGINT DEFAULT 0;` (Denormalized cache counter updated asynchronously)
     - `ADD COLUMN vote_count BIGINT DEFAULT 0;` (Denormalized cache counter)

3. Comment Reputation & Upvotes:
   - Create table `comment_reactions`:
     - `id` BIGINT AUTO_INCREMENT PRIMARY KEY
     - `comment_id` BIGINT NOT NULL (FK -> `comments(id)` ON DELETE CASCADE)
     - `user_id` BIGINT NOT NULL (FK -> `users(id)` ON DELETE CASCADE)
     - `reaction_type` VARCHAR(10) NOT NULL ('UPVOTE', 'DOWNVOTE', 'HEART')
     - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     - UNIQUE KEY `uk_comment_user_reaction` (`comment_id`, `user_id`)
   - Add denormalized counter `upvotes_count INT DEFAULT 0` to `comments` table.

4. Full-Text Search Indexes:
   - MySQL:
     - `ALTER TABLE decisions ADD FULLTEXT INDEX ft_decisions_title_desc (title, description);`
     - `ALTER TABLE communities ADD FULLTEXT INDEX ft_communities_name_desc (name, description);`
     - `ALTER TABLE comments ADD FULLTEXT INDEX ft_comments_content (content);`
   - PostgreSQL equivalent:
     - GIN indexes on `to_tsvector('english', title || ' ' || coalesce(description, ''))`.

5. Foreign Key & Performance Indexing Overhaul:
   - `CREATE INDEX idx_decisions_category_status ON decisions (category_id, status, is_deleted);`
   - `CREATE INDEX idx_decisions_created_status ON decisions (created_at DESC, status);`
   - `CREATE INDEX idx_comments_parent_created ON comments (parent_id, created_at ASC);`
   - `CREATE INDEX idx_votes_poll_option ON votes (poll_id, poll_option_id);`

DELIVERABLES:
1. `backend/src/main/resources/db/migration/V11__enhance_existing_features.sql`
2. Updated canonical schema in `database/schema.sql` and `database/schema-postgresql.sql`.
3. Updated mapping reference in `database/BACKEND_MAPPING_GUIDE.md`.
```

---

### Prompt 3.2: Backend Engineer (BE) — Enhancement of Existing Features

```text
ROLE: Principal Backend Engineer & System Architect
PROJECT: DecisionHub (Branch: team-one)
TECH STACK: Java 17 | Spring Boot 3.3.2 | Spring Security 6 | Spring Data JPA | Caffeine | Quartz/Scheduled Tasks
CONTEXT:
With migration `V11__enhance_existing_features.sql` applied, the database now supports ranked-choice voting, decision auto-closing, full-text search, denormalized counters, and comment upvoting.
You must enhance all existing backend controllers, services, and security layers to unlock these advanced capabilities.

OBJECTIVE:
Implement an enterprise-grade refactoring of DecisionHub's existing backend modules, including Ranked-Choice tallying algorithms, automated decision expiration schedulers, a unified Full-Text Global Search API, rate-limiting on voting, and export enhancements.

TECHNICAL SPECIFICATIONS:
1. Polling Engine Overhaul (`PollService.java` & `VoteService.java`):
   - Support `voting_method`:
     * `SINGLE_CHOICE`: Existing single-option ballot.
     * `APPROVAL`: User can select multiple options (`max_choices`).
     * `RANKED_CHOICE`: User submits ordered preferences (`rank_position` 1, 2, 3...). Implement Instant Runoff Voting (IRV) tallying algorithm to determine majority winner upon poll closure.
   - Prevent vote manipulation:
     * Implement token-bucket rate-limiting using Caffeine cache (Max 5 votes per minute per IP/user).
     * Add revote capability: If `allow_revoting` is true, purge previous votes in a `@Transactional` block before persisting new ballots.

2. Decision Lifecycle & Scheduled Auto-Closure:
   - Create scheduled task `com.decisionhub.scheduler.DecisionLifecycleScheduler`:
     - Runs every 5 minutes (`@Scheduled(fixedRate = 300000)`).
     - Finds all decisions where `status = 'OPEN'`, `auto_close = TRUE`, and `ends_at <= NOW()`.
     - Automatically invokes `decisionService.closeDecision(decisionId, "SYSTEM")`.
     - Computes winning option and sets `winning_option_id`.
     - Triggers `ActivityEvent` (`DECISION_CLOSED`) and fires notifications to all participants.

3. Unified Full-Text Global Search Endpoint:
   - Create `com.decisionhub.controller.SearchController` (`/api/search`):
     - Query: `GET /api/search?q={query}&type={all|decisions|communities|comments}&page=0&size=20`.
     - Implement native Full-Text search query using `MATCH(title, description) AGAINST(:q IN NATURAL LANGUAGE MODE)` in MySQL (and `tsquery` in PostgreSQL).
     - Return unified response `SearchResponse` containing grouped results: `decisions`, `communities`, `comments`.

4. Comment Reactions & Quality Ranking:
   - Enhance `CommentController.java`:
     - `POST /api/comments/{id}/react` (toggle UPVOTE/DOWNVOTE).
     - Update `upvotes_count` atomically.
   - Sort comments by:
     * "Top" (`upvotes_count DESC`)
     * "Newest" (`created_at DESC`)
     * "Oldest" (`created_at ASC`)

5. Export Engine Enhancements (`AnalyticsController.java` & `FileService.java`):
   - Upgrade PDF/CSV export to include:
     * Decision comparison factors score matrix table.
     * Full vote percentage breakdown with winning option highlight.
     * Total impressions, views, reach, and conversion rate.

6. Caching & Performance Polish:
   - Add `@Cacheable("categories")` and `@Cacheable("popularCategories")` in `CategoryService`.
   - Implement `@CacheEvict` when new decisions are created or categories are modified.

DELIVERABLES:
1. Updated `DecisionService.java`, `PollService.java`, and `VoteService.java` with Ranked-Choice & Approval voting logic.
2. `DecisionLifecycleScheduler.java` for automated decision expiration.
3. `SearchController.java` & `SearchService.java` for global full-text search.
4. Updated `CommentController.java` and `CommentService.java` with upvote/downvote and sorting.
5. Unit and integration tests covering IRV tallying, rate limiting, and auto-close triggers.
```

---

### Prompt 3.3: Frontend Engineer (FE) — Enhancement of Existing Features

```text
ROLE: Principal Frontend Engineer & Design Systems Specialist
PROJECT: DecisionHub (Branch: team-one)
TECH STACK: React 19 | Vite 5 | Tailwind CSS 3.4 | Axios | Lucide React | Framer Motion
CONTEXT:
DecisionHub has established functional foundations across 23 pages and 24 components, but requires extensive UX refinement, accessibility hardening, and advanced UI capabilities to achieve enterprise-grade polish:
- Polls need ranked-choice drag-and-drop ballots and multi-choice checkboxes.
- The platform needs a Global Command Bar (`Ctrl+K` / `Cmd+K`) for instant search.
- The Comparison Matrix needs dynamic factor weighting sliders and radar chart visualizations.
- Forms and comments need a clean Markdown editor with live preview.
- Decision cards need bookmarking animations, skeleton loaders, and keyboard shortcuts.

OBJECTIVE:
Deliver a comprehensive frontend UX enhancement across all existing pages and components, elevating aesthetics, interactions, and feature capabilities.

TECHNICAL SPECIFICATIONS:
1. Advanced Polling & Ballot UI (`frontend/src/pages/VotePage.jsx` & `PollCard.jsx`):
   - Single-Choice: Polished radio cards with active ring indicators and percentage progress fills.
   - Multi-Choice / Approval: Checkbox cards with dynamic selection counter ("Selected: 2 of 3").
   - Ranked-Choice Ballot:
     * Interactive drag-and-drop or up/down arrow rank organizer (`Rank 1: Option A`, `Rank 2: Option B`).
     * Visual confirmation of ballot submission with animated checkmark modal.

2. Global Command Bar / Spotlight Search (`frontend/src/components/CommandMenu.jsx`):
   - Triggerable via keyboard shortcut `Ctrl+K` (or `Cmd+K`) or clicking the search bar in `Navbar.jsx`.
   - Modal overlay with backdrop blur.
   - Instant search input querying `/api/search?q=...` with debounce (250ms).
   - Grouped results: Decisions, Communities, Users, with keyboard arrow navigation (`↑`/`↓`) and `Enter` to navigate.

3. Interactive Comparison Matrix Overhaul (`frontend/src/components/ComparisonMatrix.jsx`):
   - Add factor weight sliders (e.g. Weight Cost 50%, Risk 30%, Time 20%).
   - Dynamic recalculation of weighted composite score per option.
   - Radar Chart / Spider Chart visualization (using clean inline SVG) comparing option factor profiles side-by-side.

4. Markdown Editor with Live Preview:
   - Create `frontend/src/components/ui/MarkdownEditor.jsx`:
     - Toolbar: Bold, Italic, Bullet List, Link, Code Block.
     - "Write" and "Preview" tabs.
     - Integrate into `CreateDecision.jsx`, `EditDecision.jsx`, and `CommentSection.jsx`.

5. Comment Section Quality Enhancements (`CommentSection.jsx` & `CommentItem.jsx`):
   - Sort dropdown: "Top Voted", "Newest", "Oldest".
   - Upvote button with counter and optimistic count increment.
   - Highlight author badge ("Creator") if comment author is the decision owner.

6. Micro-Interactions, Skeletons & Accessibility (WCAG 2.1 AA):
   - Replace generic spinning circles with skeleton loading cards in `DashboardPage.jsx`, `AnalysisPage.jsx`, and `DecisionDetails.jsx`.
   - Add toast notification provider (`react-hot-toast` or custom custom-built glassmorphism toast) for copy-links, votes cast, and saves.
   - Keyboard shortcuts: `J` (next decision), `K` (previous decision), `V` (jump to vote).
   - Ensure high color-contrast ratio across all 4 theme accents (Black, Green, Saffron, Royal).

DELIVERABLES:
1. `CommandMenu.jsx` integrated into `Navbar.jsx` with `Ctrl+K` shortcut listener.
2. Enhanced `VotePage.jsx` supporting Single, Multi, and Ranked-Choice voting.
3. Enhanced `ComparisonMatrix.jsx` with weighting sliders and SVG radar charts.
4. `MarkdownEditor.jsx` integrated in decision creation and comments.
5. Skeleton loaders and accessible UI refinements across all pages.
```

---

## 6. Cross-Functional Team Integration & Hand-off Matrix

To guarantee seamless delivery across the three feature streams, all three roles must observe the following integration checkpoints:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PHASED EXECUTION TIMELINE                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 1: DATABASE (DB) FIRST                                                           │
│   • Execute migrations V9, V10, V11 on MySQL & PostgreSQL.                            │
│   • Update canonical schema.sql & BACKEND_MAPPING_GUIDE.md.                            │
│   • Verify schema integrity with foreign key checks & seed scripts.                    │
│                                                                                        │
│ STEP 2: BACKEND (BE) SERVICES & CONTRACTS                                             │
│   • Implement JPA Entities, Repositories, Services, and REST Controllers.              │
│   • Configure WebSocket STOMP broker at /ws-chat with JWT Interceptor.                 │
│   • Verify endpoints via Swagger UI (http://localhost:8080/swagger-ui.html).          │
│   • Publish exact DTO JSON schemas to the FE team.                                     │
│                                                                                        │
│ STEP 3: FRONTEND (FE) CLIENT & USER EXPERIENCE                                         │
│   • Implement API service functions in axiosClient.js.                                 │
│   • Build UI components with loading skeletons, animations, and theme accents.         │
│   • Connect useCommunityChat WebSocket hook with fallback polling.                     │
│   • End-to-end testing with mock & live backend services.                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Critical API & Contract References:
- **WebSocket Endpoint**: `ws://localhost:8080/ws-chat` (STOMP Broker `/topic`, App `/app`)
- **Community Chat REST**: `/api/communities/{communityId}/chat/**`
- **Recent Activities REST**: `/api/activities/**`
- **Global Search REST**: `/api/search?q={query}&type={type}`
- **Advanced Voting REST**: `/api/decisions/{id}/vote` (Payload supports `optionIds: []` and `rankPositions: {}`)

---
*Authored for the DecisionHub Engineering Core Team. Ready for sprint assignment and distribution.*
