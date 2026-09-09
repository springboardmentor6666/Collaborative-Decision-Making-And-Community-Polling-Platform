# DecisionHub — Collaborative Decision-Making & Community Polling Platform

**DecisionHub** is an enterprise-grade collaborative decision-making, polling, and community governance platform. It empowers individuals, teams, and organizations to structure complex choices using **Multi-Criteria Decision Analysis (MCDA)**, conduct verifiable community ballots using advanced voting systems (including **Instant Runoff Ranked-Choice Voting**), engage in real-time threaded chat and discussions, track polymorphic activity streams, and monitor decision outcomes with deep analytics.

---

## 🏗️ 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CLIENT LAYER (Frontend SPA)                                      │
│   • React 18 Single Page Application (Vite 5, Tailwind CSS, Framer Motion, Axios, STOMP.js)           │
│   • 25 Distinct Routes: Dashboard, MCDA Decision Boards, Poll Ballots, Live Community Chat, Analytics  │
│   • Glassmorphism Design System: 4 Curated Themes (Dark Slate, Monochrome, Emerald, Royal Blue)        │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │ HTTPS / REST JSON + WebSocket STOMP (/ws)
┌───────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│                                  BACKEND LAYER (Spring Boot 3 API)                                     │
│   • Java 17 + Spring Boot 3.3.2 Microservice                                                           │
│   • Spring Security 6: Stateless HMAC-SHA256 JWT, BCrypt Hashing, Google OAuth2, WebSocket Interceptor  │
│   • 19 REST Controllers, 24 Services, 70 DTOs, 3 Schedulers (Lifecycle, Cleanup, Digests)             │
│   • Real-Time Messaging: Embedded STOMP In-Memory Message Broker with SockJS fallback                  │
│   • Data Access: Spring Data JPA + Hibernate ORM + HikariCP Connection Pooling                        │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │ JDBC (Port 5432 / 3306)
┌───────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│                                       DATA LAYER (Relational DB)                                       │
│   • Neon Lakebase Cloud PostgreSQL 15+ / MySQL 8.0                                                     │
│   • 35 Relational Tables: Users, Profiles, Categories, Communities, Chat Channels, Messages,           │
│     Decisions, Options, Factors, Scores, Polls, Ballots, Comments, Reactions, Activities, Audit Logs    │
│   • Full-Text Search: PostgreSQL GIN Indexes & MySQL FULLTEXT Indexes                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 2. Key Platform Features

### ⚖️ Multi-Criteria Decision Analysis (MCDA)
* **Structured Decision Boards**: Define problem statements, set auto-expiration timers, and attach categorized alternatives.
* **Weighted Evaluation Criteria**: Compare options across customizable factors (e.g., Cost, Risk, Time, Scalability, Feasibility).
* **1-10 Scoring Matrix**: Evaluate alternatives on numerical scales with normalized score totals to determine objective mathematical recommendations.

### 🗳️ Advanced Polling & Ballot Voting Systems
DecisionHub implements 5 distinct democratic voting mechanisms:
1. **Single Choice**: Traditional single-option vote.
2. **Multiple Choice / Approval Voting**: Select up to $N$ acceptable alternatives.
3. **Ranked-Choice Voting (Instant Runoff Voting - IRV)**:
   - Voters rank alternatives in order of preference (1st, 2nd, 3rd...).
   - The backend runs iterative elimination rounds: candidate with the fewest #1 votes is eliminated, and their ballots are redistributed to the voter's next choice until a winner achieves a $>50\%$ majority.
4. **Weighted Polling**: Assigns dynamic fractional weights to stakeholder votes.
5. **5-Star Rating System**: Voters score options from 1 to 5 stars, calculating aggregate rating averages and sentiment distributions.

### 💬 Real-Time Community Hubs & Threaded Live Chat
* **Topic-Based Communities**: User-created hubs organized under 6 core categories (Career, Education, Technology, Travel, Finance, Lifestyle).
* **Multi-Channel Chat**: Text channels per community (e.g., `#general`, `#announcements`) powered by **WebSocket STOMP**.
* **Threaded Replies & Soft Deletes**: Reply chains preserved even when parent messages are deleted.
* **Optimistic Emoji Reactions**: Instant emoji reactions (`👍`, `❤️`, `🚀`, `💡`) with deduplication.
* **Cursor-Based Chat History**: Rapid pagination using composite indexes without table scanning.
* **Unread Message Indicators**: Channel read receipts and real-time badge updates.

### 📈 Analytics & Activity Streams
* **Polymorphic Activity Feed**: Real-time chronological event stream covering platform, community, and personal milestones.
* **Creator Analytics**: Impression counts, unique viewer reach, vote conversion rates, and engagement performance for decision authors.
* **Personal Analysis Dashboard**: History of voted decisions, win/loss alignment, and outcome tracking.
* **Custom SVG Visualizations**: High-performance animated horizontal/vertical bar charts and interactive donut charts rendered without bulky external chart libraries.

### 🛡️ Governance, RBAC & Moderation
* **Role-Based Access Control**: Strict segregation between `USER`, `MODERATOR`, and `ADMIN`.
* **Content Moderation Queue**: Flagged content review workflow for reported decisions, polls, and comments.
* **Immutable Audit Trail**: Append-only security log tracking administrative role updates, suspensions, and critical mutations.
* **Automated Background Schedulers**: Cron tasks for auto-closing expired decisions, calculating winners, and executing data retention rules.

---

## 📁 3. Repository Directory Structure

```
Collaborative-Decision-Making-And-Community-Polling-Platform/
├── .env.example                # Template environment variables file
├── .gitignore                  # Git ignore rules for Maven, Node, and IDE files
├── docker-compose.yml          # Multi-container orchestration (MySQL, Backend, Frontend)
├── LICENSE                     # Project open-source license
├── README.md                   # Master project documentation (this file)
│
├── database/                   # Database schemas, seeds & ER documentation
│   ├── README.md               # Detailed database catalog & entity mapping guide
│   ├── er-diagram.txt          # Visual ASCII Entity Relationship Diagram
│   ├── schema.sql              # MySQL 8.0 DDL relational schema definitions
│   ├── schema-postgresql.sql   # PostgreSQL / Neon Lakebase DDL with GIN search indexes
│   └── seed/
│       └── sample_data.sql     # Seed dataset (Categories, default admin, sample decisions)
│
├── backend/                    # Spring Boot 3.3.2 REST API microservice
│   ├── Dockerfile              # Multi-stage Maven build + Eclipse Temurin 17 JRE container
│   ├── pom.xml                 # Maven build dependencies & plugins
│   ├── README.md               # Backend architecture & REST API documentation
│   └── src/main/
│       ├── java/com/decisionhub/
│       │   ├── DecisionHubApplication.java # Spring Boot entry point (@EnableScheduling)
│       │   ├── config/         # Security, CORS, WebSocket, Cache, and Swagger configs
│       │   ├── controller/     # 19 REST Controllers (Auth, Decisions, Votes, Chat, etc.)
│       │   ├── dto/            # 70 Data Transfer Objects & validation records
│       │   ├── entity/         # 35 JPA Entities matching relational database tables
│       │   ├── event/          # Application domain events & listeners
│       │   ├── exception/      # GlobalExceptionHandler & custom domain exceptions
│       │   ├── repository/     # 32 Spring Data JPA repositories
│       │   ├── scheduler/      # Background cron schedulers (auto-close, cleanup)
│       │   ├── security/       # JWT filters, token utilities, OAuth2 handlers
│       │   ├── service/        # 24 Business logic services
│       │   └── util/           # File validation and helper utilities
│       └── resources/
│           ├── application.yml # Spring Boot properties & datasource configurations
│           └── db/migration/   # Flyway schema versioning scripts
│
└── frontend/                   # React 18 + Vite 5 Single Page Application
    ├── Dockerfile              # Multi-stage Node build + Nginx production container
    ├── index.html              # HTML5 entry point & web font links
    ├── nginx.conf              # Production Nginx reverse proxy & SPA router
    ├── package.json            # Frontend NPM packages & build scripts
    ├── postcss.config.js       # PostCSS Tailwind preprocessor
    ├── tailwind.config.js      # Design tokens, theme palettes & glassmorphism utilities
    ├── vite.config.js          # Vite build options & development proxy mappings
    ├── README.md               # Frontend UI architecture & routes documentation
    └── src/
        ├── App.jsx             # Top-level routing & layout coordinator
        ├── index.css           # Global theme tokens, variables & animations
        ├── api/                # Axios client with JWT interceptor & refresh handling
        ├── components/         # 27 Reusable UI components (Navbar, Modals, Polls, Cards)
        ├── components/activity/# Activity feed & event card components
        ├── components/chat/    # Real-time WebSocket chat components
        ├── components/ui/      # Design system primitives (Button, Card, Input, Toast)
        ├── context/            # React contexts (Auth, Theme, Alert, Refresh, Toast)
        ├── hooks/              # Custom hooks (useCommunityChat, useKeyboardShortcuts)
        ├── layouts/            # MainLayout page coordinator
        ├── pages/              # 25 Route views (Dashboard, Vote, Analytics, Admin, etc.)
        ├── services/           # API service modules
        ├── theme/              # Theme switcher & color palettes
        └── utils/              # Error parsers & export utilities (CSV/JSON)
```

---

## 🛠️ 4. Technology Stack Matrix

| Layer | Technologies | Key Libraries & Specifications |
|---|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS | Framer Motion, SockJS-Client, STOMP.js, Axios, Lucide Icons |
| **Backend** | Java 17, Spring Boot 3.3.2 | Spring Security 6, Spring Data JPA, Hibernate ORM, JJWT 0.12.3, Spring Mail |
| **Real-Time** | WebSocket STOMP | SockJS fallback, in-memory broker, authenticated channel interceptor |
| **Database** | PostgreSQL 15+ / MySQL 8.0 | Neon Cloud Lakebase, GIN Full-Text Indexes, HikariCP Pooling |
| **Security** | Stateless HMAC-SHA256 JWT | BCrypt (strength 10), Google OAuth2, CORS Whitelisting, RBAC |
| **DevOps** | Docker, Docker Compose, Nginx | Multi-stage builds, Alpine Linux, Reverse Proxy, Static Caching |

---

## 🔑 5. Seed Accounts & Credentials

All default seed accounts are configured with password: **`Pass123`**

| Full Name | Email Address | Password | Role | Permissions |
|---|---|:---:|:---:|---|
| **Admin Principal** | `admin@decisionhub.com` | `Pass123` | `ADMIN` | Full administrative control, user moderation, audit logs |
| **Sarah Moderator** | `sarah@decisionhub.com` | `Pass123` | `MODERATOR` | Content review, report resolutions, community oversight |
| **Alex Developer** | `alex@example.com` | `Pass123` | `USER` | Decision creation, voting, chat, comments |
| **Test User** | `testuser@example.com` | `Pass123` | `USER` | Standard user voting & discussions |
| **Demo User** | `demo@example.com` | `Pass123` | `USER` | Standard user voting & discussions |
| **Alice Smith** | `alice@example.com` | `Pass123` | `USER` | Standard user voting & discussions |

---

## 🚀 6. How to Run the Application

### Option A: Complete Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/springboardmentor6666/Collaborative-Decision-Making-And-Community-Polling-Platform.git
   cd Collaborative-Decision-Making-And-Community-Polling-Platform
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and verify database credentials:
   ```bash
   cp .env.example .env
   ```

3. **Build and Launch All Services**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Service Health**:
   ```bash
   docker compose ps
   ```

5. **Access Endpoints**:
   * 🌐 **Frontend Application**: [http://localhost:3000](http://localhost:3000)
   * ⚙️ **Backend REST API**: [http://localhost:8080](http://localhost:8080)
   * 📖 **OpenAPI / Swagger Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   * 🗄️ **MySQL Database**: `localhost:3306` (`decisionhub_db`)

---

### Option B: Local Standalone Development (Without Docker)

#### 1. Database Setup
Start a local MySQL 8.0 or PostgreSQL instance, or use a free Neon Cloud Postgres database.
Set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` in `backend/src/main/resources/application.yml` or your system environment.

#### 2. Start Backend (Spring Boot)
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

#### 3. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server starts on `http://localhost:3000` (or `http://localhost:5173`) with live proxying to `:8080`.

---

## ⚙️ 7. Environment Variables Reference

| Variable Name | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | Backend HTTP server port |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://mysql:3306/decisionhub_db` | Relational database JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | `decisionuser` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `decisionpass` | Database password |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit secret key for HMAC-SHA256 JWT tokens |
| `JWT_EXPIRATION_MS` | `86400000` | JWT token lifespan in milliseconds (24 hours) |
| `GOOGLE_CLIENT_ID` | `your-google-client-id` | Google OAuth2 client identifier |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | Google OAuth2 client secret |
| `H2_CONSOLE_ENABLED` | `false` | Disables H2 console in production environments |

---

## 🔒 8. Production Hardening & Deployment Checklist

Before deploying to a public production cloud environment:
- [x] **Secure JWT Secret**: Replace default `JWT_SECRET` with a strong, high-entropy 256-bit random key.
- [x] **Disable H2 Console**: Ensure `h2.console.enabled` is set to `false`.
- [x] **Enforce HTTPS / Reverse Proxy**: Ensure Nginx or load balancer forwards `X-Forwarded-For` and `X-Forwarded-Proto`.
- [x] **Connection Keep-Alive**: HikariCP connection pool configured with `keepalive-time: 30000` and `max-lifetime: 600000` to prevent idle cloud socket drops.
- [x] **Admin Password Seed**: `AdminUserInitializer` verifies and hashes administrator passwords via BCrypt on startup.
- [x] **Upload Volume Persistence**: Uploaded attachments and avatars are persisted to dedicated Docker volume storage.

---

## 📄 9. License

This project is licensed under the terms of the [MIT License](file:///d:/i_year/subject/tech/Projects/Collaborative-Decision-Making-And-Community-Polling-Platform/LICENSE).
