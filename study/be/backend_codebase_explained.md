# The Complete Backend File Dictionary (Detailed Edition)

This document provides a highly detailed, beginner-friendly explanation of **every single file** in the Java Spring Boot Backend. The backend acts as the central brain of the operation: it enforces the rules, talks to the database, and ensures nobody accesses data they shouldn't see.

---

## 1. The Starting Point & Configurations (`src/main/java/com/decisionhub/`)
These files configure the environment before the server even starts accepting traffic.

*   **`DecisionHubApplication.java`**: 
    *   **What it does:** The ignition switch. When a server administrator runs this file, it wakes up the Spring Boot framework, connects to the database, sets up the security filters, and opens port 8080 to listen for web traffic.
*   **`config/CorsConfig.java`**: 
    *   **The Problem:** For security reasons, web browsers (like Chrome) strictly forbid a frontend running on `website-a.com` from secretly sending data to a backend running on `website-b.com`. This is called the Same-Origin Policy.
    *   **What it does:** This file configures Cross-Origin Resource Sharing (CORS). It is a "guest list" that tells the backend, "It is safe to accept requests coming from our specific frontend URL, do not block them."
*   **`config/SecurityConfig.java`**: 
    *   **What it does:** The master lock system. It contains a list of rules defining which API URLs are public (e.g., `/api/auth/register` needs to be public so new people can join) and which require a valid digital key (e.g., `/api/votes` requires you to be logged in). It also connects the JWT filters (explained below) to the main traffic pipeline.
*   **`config/SwaggerConfig.java`**: 
    *   **What it does:** Generates an interactive, living instruction manual. It scans all the code in the backend and automatically creates a web page (usually at `/swagger-ui.html`) where developers can see every available command and even test sending data to the server without needing a frontend UI.

---

## 2. The Controllers (The Front Desk Receptionists)
Controllers live in `src/main/java/com/decisionhub/controller/`. Their only job is to stand at the front desk, receive JSON envelopes from the frontend, hand the envelopes to the back office (Services), and return the final answer to the frontend. **They do not make business decisions.**

*   **`AuthController.java`**: Receives `/login` and `/register` requests. It expects an email and password, passes them to the UserService, and returns a digital ID badge (JWT Token).
*   **`DecisionController.java`**: Maps to `/api/decisions`. If it receives a `GET` request, it asks for all decisions. If it receives a `POST` request with a title and description, it asks to create a new one. It automatically looks at the user's ID badge to figure out who is making the request, ensuring that a user is marked as the "owner" of the decision they just created.
*   **`VoteController.java`**: Maps to `/api/votes`. Receives requests containing a `pollId` and an `optionId` when a user clicks a button to vote. It also handles requests asking for the current live tallies.
*   **`CommunityController.java`**: Maps to `/api/communities`. The most complex receptionist. It handles requests to create groups, join them, leave them, and promote members. 
*   **`AnalyticsController.java`**: Handles incoming "view" events. When a user looks at a decision, the frontend pings this controller. This controller checks the user's IP address (to prevent a user from refreshing the page 100 times to fake 100 views) and records the impression.
*   **`UserController.java`**: Maps to `/api/users/me`. A simple receptionist that receives an ID badge, looks up the corresponding user in the database, and returns their profile info (name, avatar, email).
*   **`PollController.java`**: Handles fetching raw poll data independent of the decision it is attached to.
*   *(Dormant)* **`CategoryController`, `CommentController`, `ModerationController`, `NotificationController`**: These are fully staffed reception desks waiting for visitors, but the frontend currently has no code written to visit them. They handle categorizing topics, leaving text comments, reporting bad posts, and fetching user alerts.

---

## 3. The Services (The Back Office Workers)
Services live in `src/main/java/com/decisionhub/service/`. This is where the actual "thinking" happens. They enforce the business rules.

*   **`UserService.java`**: When given a registration request, it checks the database to see if the email is already taken. If it is, it rejects the request. If not, it uses a cryptographic tool to scramble (hash) the user's password before saving it, ensuring that even if the database is hacked, the passwords are unreadable.
*   **`DecisionService.java`**: When asked to create a decision, it doesn't just save a row in the database. It looks at the request, and if the user also included poll options, it orchestrates the creation of the Decision, the Poll, and the PollOptions all at the exact same time, ensuring they are perfectly linked together.
*   **`VoteService.java`**: The strict auditor. Before it allows a vote to be saved, it runs a query: "Has this User ID already voted on this Poll ID?" If the answer is yes, it throws a massive error (`DuplicateVoteException`) and completely blocks the action. When asked for results, it does the math to determine which option is currently winning.
*   **`CommunityService.java`**: The permissions enforcer. If User A tries to delete a community, this service checks the database to see if User A's role is "OWNER". If it's just "MEMBER", it denies the action. It also prevents an "OWNER" from leaving a group unless they give ownership to someone else first, preventing leaderless groups.
*   **`AnalyticsService.java`**: The statistician. It aggregates view logs to calculate how many total views a creator has across all their decisions, and compares that to total votes to generate an "engagement percentage".
*   *(Dormant)* **`CategoryService`, `CommentService`, `ModerationService`, `NotificationService`, `AuthService`, `PollService`**: Enforce the rules for the unused features (e.g., ensuring you can't comment on a deleted decision).

---

## 4. The Exceptions (The Error Messengers)
Located in `src/main/java/com/decisionhub/exception/`. When a Service encounters a rule violation, it "throws" an exception.

*   **`DuplicateVoteException`, `UserNotFoundException`, `DecisionNotFoundException`, `CommunityNotFoundException`, `PollNotFoundException`**: These are highly specific alarm bells. Instead of a generic "Something went wrong", the service rings a specific bell (e.g., "The user tried to vote twice!").
*   **`GlobalExceptionHandler.java`**: The "PR Department". When an alarm bell rings, the server would normally crash and send a terrifying wall of Java error text to the frontend. This file catches all the alarms, silences them, and translates them into a polite, clean JSON response (e.g., `{"status": 409, "message": "You have already voted on this poll"}`) that the frontend can easily display to the user in a red box.
*   **`ErrorDetails.java`**: The standard cardboard box that all polite error messages are packaged into.

---

## 5. Security (`src/main/java/com/decisionhub/security/`)
The security layer acts as the bouncers for the application.

*   **`JwtUtil.java`**: The "ID Badge Maker". When a user logs in successfully, this file uses a highly secure, secret mathematical password (stored in `application.yml`) to generate a long string of gibberish (a JSON Web Token). Because it is mathematically signed, the server knows if a hacker tries to forge or alter it.
*   **`JwtFilter.java`**: The "Front Door Bouncer". This file physically intercepts *every single request* coming into the server. It strips the JWT badge off the request, hands it to `JwtUtil` to verify it isn't fake or expired, and if it is valid, it reads the user's email out of the badge and places it in a "Security Context" so the Controllers know exactly who is inside the building.
*   **`CustomUserDetailsService.java`**: A helper that looks up a user's database record to ensure their account hasn't been deleted or banned since the last time they logged in.
*   **`LegacyPasswordEncoder.java`**: The tool used by the `UserService` to scramble and unscramble passwords.
*   **`oauth/OAuth2AuthenticationFailureHandler.java` & `OAuth2AuthenticationSuccessHandler.java`**: Specialized files that handle the complex handshake when a user clicks "Log in with Google".

---

## 6. DTOs (Data Transfer Objects)
Located in `src/main/java/com/decisionhub/dto/`. DTOs are the shipping containers of the application. 

*   **The Concept:** A Database "Entity" represents a raw row in the database. A `User` entity contains a `password_hash`. We **never** want to accidentally send a password hash to the frontend. Therefore, we use DTOs. We take the safe data (Name, Email) out of the Entity, put it in a `UserResponse` DTO, and ship the DTO instead.
*   **Incoming Requests (`LoginRequest`, `RegisterRequest`, `DecisionRequest`, `VoteRequest`, `CommunityRequest`):** These dictate exactly what fields the frontend is allowed to send. If the frontend tries to send a field called `isAdmin: true` during registration, the `RegisterRequest` DTO will completely ignore it because it doesn't have a slot for it, preventing hackers from cheating the system.
*   **Outgoing Responses (`AuthResponse`, `CommunityResponse`, `DecisionResponse`, `UserResponse`, `VoteResponse`, `VoteResultResponse`):** These dictate exactly what the frontend receives.
*   **Complex Responses (`MyVoteAnalysisDto`, `CreatorAnalyticsResponse`, `OptionBreakdownDto`, `OptionDto`, `UserChoiceDto`, `WinningChoiceDto`):** These are specialized containers used by the Analytics services. Because analytics require combining data from 5 different database tables (Votes, Polls, Decisions, Options, Users), these DTOs are used to package all that math into one clean, easy-to-read JSON package for the frontend charts to digest.

---

## 7. The Database Bridge (Repositories)
Located in `src/main/java/com/decisionhub/repository/`. These are the files that actually talk to the MySQL database.

*   **`UserRepository`, `DecisionRepository`, `VoteRepository`, `CommunityRepository`, `CommunityMemberRepository`, `CategoryRepository`, `CommentRepository`, `ComparisonFactorRepository`, `DecisionImpressionRepository`, `DecisionOptionRepository`, `ModerationFlagRepository`, `NotificationRepository`, `OptionScoreRepository`, `PollOptionRepository`, `PollRepository`, `UserProfileRepository`**: 
    *   **How they work:** In older languages, developers had to write raw SQL code (e.g., `SELECT * FROM users WHERE email = 'test@test.com'`). In Spring Boot, these files use "Hibernate Magic". You simply declare an interface with a method named `findByEmail(String email)`, and the framework automatically writes and executes the complex, highly-optimized SQL query behind the scenes. The Services rely entirely on these Repositories to fetch and save data.
