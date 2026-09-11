# 🏛️ DecisionHub Platform Architecture

**DecisionHub** is an enterprise-grade, full-stack collaborative decision-making, community governance, and polling platform built with **Java 21 / Spring Boot 3.4.3**, **React 19 / TypeScript / Vite 8**, **PostgreSQL**, and **STOMP/WebSocket**.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Browser / SPA)"]
        ReactApp["React 19 SPA (Vite + TypeScript)"]
        TanStack["TanStack React Query Cache"]
        WSClient["STOMP / SockJS WebSocket Client"]
        AuthCtx["Auth & Session Context"]
    end

    subgraph IngressLayer ["Ingress & Reverse Proxy Layer"]
        Nginx["Nginx / Cloudflare Edge Proxy"]
    end

    subgraph BackendLayer ["Spring Boot 3.4 Backend (Java 21)"]
        subgraph SecurityFilter ["Security & Filter Chain"]
            CORS["CORS Filter"]
            JWTFilter["JWT Auth Filter (HMAC-SHA512)"]
            OAuthVerify["Google OAuth2 Token Verifier"]
        end

        subgraph Controllers ["REST API Controllers"]
            AuthCtrl["Auth & User Controller"]
            DecCtrl["Decision & Poll Controller"]
            ElectCtrl["Election & Nominee Controller"]
            CommCtrl["Community Controller"]
            FileCtrl["File & Media Controller"]
            AdminCtrl["Admin & Moderation Controller"]
        end

        subgraph RealTimeBroker ["Real-Time Messaging Engine"]
            WSBroker["Spring STOMP Message Broker (/topic, /queue)"]
            WSAuth["WebSocket Auth Interceptor"]
        end

        subgraph Services ["Core Business Logic Services"]
            AuthSvc["Auth & Security Service"]
            DecSvc["Decision & Voting Engine"]
            ElectSvc["Election & Nominee Service"]
            CommSvc["Community Governance Service"]
            AuditSvc["Audit Logging & Compliance"]
            NotifySvc["Notification & Email Dispatcher"]
        end

        subgraph Scheduler ["Scheduled Jobs Engine"]
            Cron["Poll Expiration & Digest Scheduler"]
        end
    end

    subgraph DataLayer ["Persistence & Storage Tier"]
        Flyway["Flyway Migration Engine (V1 - V10)"]
        Postgres[("PostgreSQL 14+ Database")]
        FileStorage[("Local / Cloud Object Storage (/uploads)")]
    end

    ReactApp -->|HTTPS REST API Calls| Nginx
    WSClient -->|WSS WebSocket Upgrade| Nginx
    Nginx -->|/api/*| CORS
    Nginx -->|/ws/*| WSAuth
    Nginx -->|/uploads/*| FileStorage

    CORS --> JWTFilter --> OAuthVerify --> Controllers
    WSAuth --> WSBroker

    Controllers --> Services
    WSBroker <--> DecSvc
    WSBroker <--> ElectSvc
    Services --> Postgres
    Services --> FileStorage
    Cron --> DecSvc
    Flyway --> Postgres
```

---

## 2. Backend Architecture & Layers

The backend follows **Clean Architecture & Domain-Driven Layering**:

- **Presentation Layer (`com.decisionhub.controller`):** REST endpoints annotated with SpringDoc OpenAPI 3.0 tags and Jakarta Validation (`@Valid`).
- **Security & Authorization (`com.decisionhub.security`, `com.decisionhub.config`):** Stateless JWT filter chain, Google OAuth2 token verification, role-based method authorization (`@PreAuthorize`), and STOMP WebSocket authorization.
- **Service Layer (`com.decisionhub.service.impl`):** Declarative transaction boundaries (`@Transactional`), business rules, scoring computations, and event publishing.
- **Data Access Layer (`com.decisionhub.repository`, `com.decisionhub.specification`):** Spring Data JPA repositories with dynamic JPA Specifications and soft-delete filters.
- **Real-Time Messaging Subsystem (`com.decisionhub.websocket`):** STOMP over WebSocket with SockJS fallback. Publishes live vote updates, discussion comments, and private notifications.
- **Auditing & Reporting (`com.decisionhub.audit`, `com.decisionhub.service.impl.ReportServiceImpl`):** Immutable audit logs, OpenPDF PDF generator, and Apache POI Excel report exports.

---

## 3. Frontend Architecture

The frontend is structured into modular domain features:

- **State Management & Caching:** `@tanstack/react-query` for server state caching, background refetching, and optimistic updates.
- **Real-Time Integration:** `WebSocketContext` with auto-reconnecting STOMP client.
- **Design System:** Tailwind CSS v4, Radix UI headless primitives, Lucide Icons, and Recharts.

---

## 4. Entity-Relationship Data Model

```mermaid
erDiagram
    USERS ||--o{ DECISIONS : "creates"
    USERS ||--o{ VOTES : "casts"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ COMMUNITY_MEMBERS : "joins"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--|| USER_PREFERENCES : "configures"
    USERS }o--|| ROLES : "assigned"

    COMMUNITIES ||--o{ COMMUNITY_MEMBERS : "contains"
    COMMUNITIES ||--o{ DECISIONS : "houses"

    DECISIONS ||--|{ OPTIONS : "has"
    DECISIONS ||--o{ COMMENTS : "contains"
    DECISIONS ||--o{ VOTES : "collects"
    DECISIONS ||--o{ ATTACHMENTS : "includes"

    VOTES ||--|{ VOTE_SELECTIONS : "records"
    OPTIONS ||--o{ VOTE_SELECTIONS : "receives"

    VOTING_EVENTS ||--|{ VOTING_CATEGORIES : "organizes"
    VOTING_CATEGORIES ||--|{ NOMINEES : "lists"
    NOMINEES ||--o{ ELECTION_VOTES : "receives"
    USERS ||--o{ ELECTION_VOTES : "casts"

    USERS ||--o{ ABUSE_REPORTS : "submits"
    AUDIT_LOGS }o--|| USERS : "performed_by"
```
