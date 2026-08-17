# Feature Deep Dive: Community Management

This document provides a comprehensive, beginner-friendly explanation of how users can create private workspaces, join groups, and manage the hierarchy of roles (Owner, Admin, Member) within those groups.

---

## 1. The Frontend Experience (React)

### The Directory (CommunitiesPage)
*   **`frontend/src/pages/CommunitiesPage.jsx`**
    *   **The User Journey:** This acts like a phone book or a directory for the entire platform. When a user navigates here, they see a list of all groups they can join.
    *   **The Search Tool:** There is a search bar. As the user types, React doesn't necessarily ask the backend for a new list every single time they press a key. It can filter the existing list of `CommunityCard` components instantly on their screen, making the search feel lightning fast.

### The Group Hub (CommunityDetails)
*   **`frontend/src/pages/CommunityDetails.jsx`**
    *   **The Triple Fetch:** When a user clicks into a specific group (e.g., "The Engineering Team"), this page has a lot of work to do. It fires off three separate requests to the backend at almost the exact same time:
        1.  "Get me the title and description of this group."
        2.  "Get me the list of every human who is a member of this group."
        3.  "Get me every decision/poll that was posted *inside* this specific group."
    *   **The Logic Gates:** Once it has the list of members, it checks if the current logged-in user is on that list. If they are *not* on the list, it shows a giant "Join Community" button. If they *are* on the list, it shows a "Leave Community" button instead.

---

## 2. The Backend Engine (Java Spring Boot)

### The Receptionist (CommunityController)
*   **`backend/src/main/java/com/decisionhub/controller/CommunityController.java`**
    *   **The Workload:** This is the busiest receptionist in the building. It exposes over 10 different URLs (endpoints), handling everything from creating a community to kicking a user out.

### The Permissions Enforcer (CommunityService)
*   **`backend/src/main/java/com/decisionhub/service/CommunityService.java`**
    *   **The Hierarchy:** The platform enforces three strict roles: `OWNER` (the creator), `ADMIN` (managers), and `MEMBER` (regular users).
    *   **Enforcing the Rules:** If a request comes in asking to promote User B to an `ADMIN`, the service pauses. It checks the database to see the role of the person making the request. 
        *   If the requester is an `OWNER`, the request is approved.
        *   If the requester is a `MEMBER` or an `ADMIN`, the service throws an `AccessDeniedException` and blocks the promotion.
    *   **The "No Empty Thrones" Rule:** If the `OWNER` tries to click "Leave Community", the service runs a check. If there are other people in the group, it refuses to let the owner leave, forcing them to transfer ownership to someone else first so the group isn't left leaderless.

---

## 3. The Database Ledger (MySQL)

### The Junction Table Problem
In a database, a `User` table has rows of people. A `Community` table has rows of groups. But how do you record that User #1 is in Group #5? You cannot put a list of numbers inside a single spreadsheet cell in a relational database. 

The solution is a **Junction Table**.

### `community_members` (The Junction Table)
*   **Entity File:** `backend/src/main/java/com/decisionhub/entity/CommunityMember.java`
*   **How it works:** This table acts as a bridge. Every time someone joins a group, a single row is added here connecting the two IDs.
*   **What it looks like in practice:**

| id | user_id | community_id | role | joined_at |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 10 | 5 | OWNER | 2024-05-10 |
| 2 | 22 | 5 | MEMBER | 2024-05-11 |
| 3 | 35 | 5 | ADMIN | 2024-05-12 |

By looking at this bridge table, the backend can instantly answer complex questions like: "Give me a list of all `user_id`s who belong to `community_id` 5 where the `role` is ADMIN."

### Scoping Decisions
*   **The Link:** How does a decision belong to a group? The `decisions` table has an optional column called `community_id`.
*   **The Logic:** If a user creates a public, global poll, that column is left blank (`NULL`). But if they create it *inside* the "Engineering" group (Community ID 5), the decision is saved with `community_id = 5`. When the frontend asks for the group's decisions, the backend simply runs: `SELECT * FROM decisions WHERE community_id = 5`.
