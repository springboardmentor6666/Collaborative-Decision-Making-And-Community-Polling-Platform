# The Complete Database File & Table Dictionary (Detailed Edition)

This document provides a highly detailed, beginner-friendly explanation of the Database layer. In a modern Spring Boot application, developers rarely write raw SQL tables manually. Instead, they write Java "Entity" files. The framework reads these Java files and automatically constructs the corresponding tables in the MySQL database. 

This guide explains every single Entity file (which becomes a Database Table) and the SQL migration files that accompany them.

---

## 1. The Application Configuration
*   **`backend/src/main/resources/application.yml`**: 
    *   **What it does:** This is the master instruction manual for the backend. It contains the database URL (where the database lives on the network), the username, and the password. 
    *   **The Crucial Setting:** It contains a setting called `hibernate.ddl-auto: update`. This is a command that tells the backend: "Every time you turn on, look at all the Java Entity files. If you see a new file, create a new table. If you see a new variable, add a new column to the database automatically." While convenient for rapid prototyping, this is considered highly dangerous in a production environment because it can accidentally delete or corrupt data if a developer makes a mistake in the Java code.

---

## 2. The Core Tables (Entities)
Every file here translates directly to a spreadsheet-like table in the MySQL Database. The backend Services read and write rows to these tables.

*   **`User.java` (Table: `users`)**: 
    *   **Purpose:** Stores all account details. 
    *   **Columns:** Includes the user's `email`, the scrambled `password_hash`, their `full_name`, their `role` (User vs Admin), and an `is_active` boolean (which allows administrators to ban an account without actually deleting their voting history).
    *   **Mechanics:** It uses a `@PrePersist` trigger. Right before a new user is saved to the database for the first time, this trigger automatically stamps the current date and time into the `created_at` column.
*   **`Decision.java` (Table: `decisions`)**: 
    *   **Purpose:** The central object of the platform representing a topic up for debate.
    *   **Columns:** Stores the `title`, the long `description` text, the `status` (is it open for voting or closed?), and `visibility` (can anyone see it, or just a specific community?). It also has a raw `views` counter.
    *   **Connections (Foreign Keys):** It has an `owner_id` column that links directly back to the `users` table so we know who created it.
*   **`Poll.java` (Table: `polls`)**: 
    *   **Purpose:** While a Decision is the general topic, the Poll stores the actual question being asked (e.g., "Where should we eat?").
    *   **Connections:** Linked directly to a Decision via a `decision_id` column.
*   **`PollOption.java` (Table: `poll_options`)**: 
    *   **Purpose:** Stores the specific, selectable choices available for a poll (e.g., Row 1: "Pizza", Row 2: "Burgers"). 
    *   **Connections:** Linked to a Poll via a `poll_id` column.
*   **`Vote.java` (Table: `votes`)**: 
    *   **Purpose:** The most important ledger in the application. It acts as an immutable record of every vote cast.
    *   **Columns & Connections:** Every time someone votes, a single row is created here storing exactly three things: Who voted (`voter_id`), which Poll they voted on (`poll_id`), and which Option they chose (`poll_option_id`). 
    *   **The Golden Rule:** The database and backend work together to ensure that any specific combination of `voter_id` and `poll_id` can only exist in this table exactly once, completely preventing a user from voting twice.
*   **`Community.java` (Table: `communities`)**: 
    *   **Purpose:** Stores the names and descriptions of user-created workspaces or groups (like "Engineering Team").
*   **`CommunityMember.java` (Table: `community_members`)**: 
    *   **Purpose:** A "Junction Table". 
    *   **Why it exists:** One user can be in many groups, and one group can have many users. You cannot store that relationship in a single column. This table acts as a bridge. 
    *   **Columns:** It stores a `user_id`, a `community_id`, and crucially, a `role` column. This role column dictates if that specific user is an "OWNER", an "ADMIN", or a regular "MEMBER" of that specific community.
*   **`DecisionImpression.java` (Table: `decision_impressions`)**: 
    *   **Purpose:** A massive, constantly growing event log. Every single time a page is viewed, a new row is inserted here recording the IP address and the exact millisecond timestamp. This allows the analytics engine to draw graphs of traffic over time.

---

## 3. The Unused / Dormant Tables
These Java files successfully command the database to generate tables, but because the frontend has no buttons or screens to use these features, the tables remain completely empty and gather dust.

*   **`Category.java` (Table: `categories`)**: Intended to tag decisions (e.g., #Sports, #Tech) so users can filter feeds.
*   **`Comment.java` (Table: `comments`)**: Intended to store text-based discussion threads under decisions, separate from the poll itself.
*   **`ModerationFlag.java` (Table: `moderation_flags`)**: Intended to act as an inbox for administrators, storing reports when a user flags a post as inappropriate or spam.
*   **`Notification.java` (Table: `notifications`)**: Intended to store alerts for users (e.g., "User X just voted on your poll!"). It includes a boolean column `is_read` to track if the user has seen the alert yet.
*   **`UserProfile.java` (Table: `user_profiles`)**: An extension of the `users` table intended to store extra bio data (like location or personal website) without cluttering the main authentication table.
*   **`ComparisonFactor.java` & `OptionScore.java`**: Intended for a highly complex voting system where, instead of just picking one option, users score multiple options across different factors (e.g., scoring a restaurant on "Price", "Taste", and "Distance"). This feature is entirely unused.
*   **`Role.java`**: An unused table. The original developer intended to use this table to manage user roles, but abandoned it. Roles are currently just saved as plain text (e.g., "USER") directly inside the `users` table, rendering this file useless.

---

## 4. The Ignored SQL Scripts (Technical Debt)
Inside `backend/src/main/resources/db/migration/`, there are four raw SQL files:
*   `V1__init_schema.sql`
*   `V2__add_status_to_decisions.sql`
*   `V3__add_analytics_impressions.sql`
*   `V4__add_community_group_support.sql`

*   **What they are:** These are "Flyway" scripts. In professional, enterprise environments, developers do not trust Java to automatically build the database. Instead, they write explicit SQL code (like `CREATE TABLE users (...)`) to build and alter tables safely, step-by-step over time.
*   **Why they are here:** A developer took the time to write them to structure the database properly and professionally.
*   **The Big Problem:** They are completely ignored. As mentioned in Section 1, the `application.yml` file explicitly tells the system to turn off Flyway (`flyway.enabled: false`) and ignore these scripts. The application is running on "auto-pilot", letting Java guess how to build the tables. If this application were to go into production, a senior engineer would immediately demand that auto-pilot be turned off and these Flyway scripts be turned on to prevent catastrophic data loss during future updates.
