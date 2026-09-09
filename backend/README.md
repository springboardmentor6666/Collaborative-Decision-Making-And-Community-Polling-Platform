# DecisionHub — Backend API & Microservice Specification (`/backend`)

The **DecisionHub Backend** is an enterprise-grade REST and real-time WebSocket microservice developed with **Java 17**, **Spring Boot 3.3.2**, **Spring Security 6**, **Spring Data JPA / Hibernate**, and **WebSocket STOMP**. It provides secure multi-criteria decision analysis, dynamic community polling, real-time threaded chat, polymorphic activity streams, and administrative governance.

---

## 📁 Package & Directory Architecture

```
backend/
├── Dockerfile                      # Multi-stage Maven builder + Eclipse Temurin 17 JRE
├── pom.xml                         # Maven project dependencies & build plugins
├── README.md                       # Backend technical documentation (this file)
└── src/main/
    ├── java/com/decisionhub/
    │   ├── DecisionHubApplication.java # Spring Boot main entry point (@EnableScheduling, @EnableCaching)
    │   ├── config/                 # Framework configuration beans
    │   │   ├── AdminUserInitializer.java # Auto-seeds admin user with BCrypt password on startup
    │   │   ├── AuditingConfig.java # JPA auditing configuration (@CreatedDate, @LastModifiedDate)
    │   │   ├── CacheConfig.java    # In-memory caching for category and decision metadata
    │   │   ├── CorsConfig.java     # Cross-Origin Resource Sharing policy definition
    │   │   ├── SecurityConfig.java # Spring Security 6 filter chain & endpoint rules
    │   │   ├── SwaggerConfig.java  # OpenAPI 3 / Swagger documentation setup
    │   │   └── WebSocketConfig.java# STOMP broker registration and destination mappings
    │   ├── controller/             # 19 REST API Controllers (Presentation Tier)
    │   │   ├── ActivityController.java      # /api/activities (global, community, user activity)
    │   │   ├── AdminController.java         # /api/admin (user management, roles, system audits)
    │   │   ├── AnalyticsController.java     # /api/analytics (impressions, conversion rates)
    │   │   ├── AuthController.java          # /api/auth (login, register, refresh, OAuth, reset)
    │   │   ├── CategoryController.java      # /api/categories (taxonomy lookup and browsing)
    │   │   ├── CommentController.java       # /api/comments (threaded comments, reactions)
    │   │   ├── CommunityChatController.java # /api/communities/{id}/chat (channels, history, pins)
    │   │   ├── CommunityChatWsController.java # WebSocket STOMP chat messaging endpoints
    │   │   ├── CommunityController.java     # /api/communities (hubs, members, invites)
    │   │   ├── DecisionController.java      # /api/decisions (CRUD, criteria, scores, lifecycle)
    │   │   ├── FileController.java          # /api/files (uploads, attachments, avatars)
    │   │   ├── ModerationController.java    # /api/moderation (flags, reports, resolutions)
    │   │   ├── NotificationController.java  # /api/notifications (alerts, preferences)
    │   │   ├── PollController.java          # /api/polls (poll configs, options, tallies)
    │   │   ├── RecommendationController.java# /api/recommendations (algorithmic suggestions)
    │   │   ├── SearchController.java        # /api/search (full-text cross-entity search)
    │   │   ├── SuggestionController.java    # /api/suggestions (community option proposals)
    │   │   ├── UserController.java          # /api/users (profile, interests, bookmarks)
    │   │   └── VoteController.java          # /api/votes (ballot submission, IRV calculations)
    │   ├── dto/                    # 70 Request/Response DTOs & Validation Records
    │   ├── entity/                 # 35 JPA Entities matching relational schema
    │   ├── event/                  # Domain application events & asynchronous listeners
    │   ├── exception/              # GlobalExceptionHandler & domain-specific exceptions
    │   ├── repository/             # 32 Spring Data JPA Repositories
    │   ├── scheduler/              # Automated background maintenance tasks
    │   │   ├── AccountLifecycleScheduler.java   # Inactive account retention & token cleanup
    │   │   ├── DecisionLifecycleScheduler.java  # Auto-close expired decisions & pick winners
    │   │   └── NotificationScheduler.java       # Digest notification cleanup
    │   ├── security/               # Security, JWT, and OAuth2 utilities
    │   │   ├── CustomUserDetailsService.java    # Database user authentication loader
    │   │   ├── JwtFilter.java                   # Bearer token validation filter
    │   │   ├── JwtUtil.java                     # HMAC-SHA256 token generation & validation
    │   │   ├── LegacyPasswordEncoder.java       # BCrypt password hashing adapter
    │   │   ├── WebSocketAuthChannelInterceptor.java # STOMP CONNECT frame JWT authentication
    │   │   └── oauth/                           # Google OAuth2 integration & handlers
    │   ├── service/                # 24 Business Logic Services (Service Tier)
    │   └── util/                   # File validation and utility helpers
    └── resources/
        ├── application.yml         # Application properties (Datasource, HikariCP, JWT, OAuth2)
        └── db/migration/           # Flyway schema versioning
```

---

## 🔐 Security & Authentication Engine

### 1. Stateless JWT Token Flow
* **Signing Algorithm**: HMAC-SHA256 using `JWT_SECRET`.
* **Token Expiration**: Configurable (default 24 hours / 86,400,000 ms).
* **Silent Refresh**: Frontend invokes `/api/auth/refresh` with active session credentials to obtain fresh tokens without forcing re-login.
* **Filter Pipeline**: `JwtFilter` intercepts every inbound request, extracts the `Authorization: Bearer <token>` header, parses claims, and populates the `SecurityContextHolder`.

### 2. Google OAuth2 Integration
* Authenticates users with Google credentials via `GoogleAuthService`.
* Automatically provisions new user accounts with provider set to `GOOGLE`.
* Emits a standard JWT Bearer token upon successful verification via `OAuth2AuthenticationSuccessHandler`.

### 3. Role-Based Access Control (RBAC)
* **`USER`**: Can create decisions, submit option suggestions, cast votes, post comments, join communities, and update personal profile data.
* **`MODERATOR`**: Inherits `USER` rights; can review flagged content, resolve moderation tickets, and moderate assigned community spaces.
* **`ADMIN`**: Full platform authority; manages user accounts, updates roles, views system audit logs, configures system settings, and oversees platform analytics.

### 4. WebSocket STOMP Authentication
* Standard HTTP Authorization headers cannot be passed via browser WebSocket APIs.
* Handled by `WebSocketAuthChannelInterceptor`: intercepts the STOMP `CONNECT` frame, extracts the Bearer token from native STOMP headers, validates the signature via `JwtUtil`, and sets the user principal on the WebSocket session.

---

## 📡 Real-Time WebSocket Chat Architecture

* **Broker Protocol**: STOMP over SockJS fallback.
* **Connection Endpoint**: `http://localhost:8080/ws` (proxied via `/ws` in Vite/Nginx).
* **Application Inbound Prefix**: `/app`
* **Broker Outbound Subscriptions**: `/topic`

### Real-Time Topics
| Inbound Destination (`/app`) | Outbound Subscription (`/topic`) | Purpose |
|---|---|---|
| `/app/chat.sendMessage` | `/topic/community.{communityId}.channel.{channelId}` | Broadcasts new messages & replies |
| `/app/chat.react` | `/topic/community.{communityId}.channel.{channelId}.reactions` | Broadcasts emoji reactions |
| `/app/chat.typing` | `/topic/community.{communityId}.channel.{channelId}.typing` | Broadcasts user typing indicators |
| `/app/chat.markRead` | `/topic/community.{communityId}.channel.{channelId}.reads` | Updates channel read receipts |

---

## 🌐 Complete REST API Endpoint Catalog

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new account with email, name, password |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive Bearer JWT |
| `POST` | `/api/auth/google` | Public | Sign in or register using Google OAuth2 ID token |
| `POST` | `/api/auth/refresh` | Authenticated | Renew expiring JWT session |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate client session |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token via email |
| `POST` | `/api/auth/reset-password` | Public | Set new password using reset verification token |

### 2. Decisions & Evaluation (`/api/decisions`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/decisions` | Public | List decisions with category, status, search, and pagination |
| `GET` | `/api/decisions/{id}` | Public | Retrieve full decision board, options, scores, and poll |
| `POST` | `/api/decisions` | `USER` | Create a new collaborative decision board |
| `PUT` | `/api/decisions/{id}` | Owner / Admin | Update decision metadata, status, or comparison factors |
| `DELETE`| `/api/decisions/{id}` | Owner / Admin | Soft-delete decision board |
| `POST` | `/api/decisions/{id}/options` | Owner | Add new alternatives to decision board |
| `POST` | `/api/decisions/{id}/factors` | Owner | Add comparison factors (e.g. Cost, Risk, Time) |
| `POST` | `/api/decisions/{id}/scores` | Owner | Save multi-criteria evaluation score matrix |
| `POST` | `/api/decisions/{id}/close` | Owner / Admin | Manually close decision and declare winning option |

### 3. Polling & Voting (`/api/polls`, `/api/votes`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/polls/{id}` | Public | Retrieve poll configuration and current results |
| `POST` | `/api/votes` | `USER` | Cast a ballot (Single, Multiple, IRV Ranked, 5-Star Rating) |
| `GET` | `/api/votes/my-votes` | `USER` | Retrieve authenticated user's voting history and outcomes |
| `GET` | `/api/votes/analysis/{decisionId}` | Public | Retrieve Instant Runoff Voting round-by-round elimination data |

### 4. Community Hubs & Chat (`/api/communities`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/communities` | Public | Browse and search communities with category filters |
| `GET` | `/api/communities/{id}` | Public | Retrieve community details, channels, and member counts |
| `POST` | `/api/communities` | `USER` | Create a new interest community |
| `POST` | `/api/communities/{id}/join` | `USER` | Join community membership |
| `POST` | `/api/communities/{id}/leave` | `USER` | Leave community membership |
| `GET` | `/api/communities/{id}/chat/channels` | Member | List chat channels in community |
| `POST`| `/api/communities/{id}/chat/channels` | Moderator | Create new chat channel |
| `GET` | `/api/communities/{id}/chat/channels/{chId}/messages` | Member | Cursor-paginated chat history |
| `POST`| `/api/communities/{id}/chat/channels/{chId}/messages` | Member | Post new chat message / reply |

### 5. Discussions & Comments (`/api/comments`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/comments/decision/{decisionId}`| Public | Fetch threaded recursive comment tree |
| `POST` | `/api/comments` | `USER` | Post a top-level comment or reply to existing comment |
| `POST` | `/api/comments/{id}/reaction` | `USER` | Toggle reaction (UPVOTE, DOWNVOTE, HEART) |
| `DELETE`| `/api/comments/{id}` | Author/Mod | Soft-delete comment |

### 6. Activity & Analytics (`/api/activities`, `/api/analytics`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/activities/global` | Public | Platform-wide public activity event feed |
| `GET` | `/api/activities/community/{id}` | Member | Community-scoped activity stream |
| `GET` | `/api/activities/user/{id}` | Public | User profile contribution timeline |
| `GET` | `/api/analytics/creator` | `USER` | Creator dashboard: impressions, views, conversion rate |
| `POST` | `/api/analytics/impression` | Public | Record decision view or impression event |

### 7. Governance, Administration & Moderation (`/api/admin`, `/api/moderation`)
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/users` | `ADMIN` | List and search users with role and status filters |
| `PUT` | `/api/admin/users/{id}/role` | `ADMIN` | Update user role (USER, MODERATOR, ADMIN) |
| `PUT` | `/api/admin/users/{id}/status`| `ADMIN` | Suspend, deactivate, or reactivate user accounts |
| `GET` | `/api/admin/stats` | `ADMIN` | High-level system statistics and time-series metrics |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Security audit trail logs |
| `POST` | `/api/moderation/report` | `USER` | Report offensive content |
| `GET` | `/api/moderation/flags` | `MODERATOR` | View pending moderation queue |
| `PUT` | `/api/moderation/flags/{id}/resolve`| `MODERATOR` | Resolve or dismiss moderation flag |

---

## ⏱️ Background Schedulers

Configured via `@EnableScheduling` on `DecisionHubApplication`:
1. **`DecisionLifecycleScheduler`**: Runs every 60 seconds. Identifies open decisions where `ends_at <= NOW()` and `auto_close = TRUE`, marks them `CLOSED`, calculates winning options, and publishes a `DECISION_CLOSED` activity event.
2. **`NotificationScheduler`**: Runs daily at midnight. Purges read notifications older than 30 days and dispatches pending digest notifications.
3. **`AccountLifecycleScheduler`**: Runs daily at 02:00 AM. Purges expired password reset tokens and executes permanent deletions for accounts requested > 30 days ago.

---

## 🛠️ Local Development & Build

### Prerequisites
* **Java 17** (Eclipse Temurin or OpenJDK)
* **Maven 3.8+**
* **MySQL 8.0** or **PostgreSQL 15+**

### Compile & Verify
```bash
cd backend
mvn clean compile -DskipTests
```

### Run Tests
```bash
mvn test
```

### Run Locally (Standalone)
Ensure database connection properties match your `.env`:
```bash
mvn spring-boot:run
```
API starts at: `http://localhost:8080`
OpenAPI Swagger documentation: `http://localhost:8080/swagger-ui.html`
