# Feature Deep Dive: Decisions Management

This document provides an exhaustive, step-by-step breakdown of how Decisions (the core topics, questions, or debates on the platform) are created, displayed, and managed across the entire software stack.

---

## 1. The Frontend Experience (React)

### The Feed (Dashboard)
*   **`frontend/src/pages/Dashboard.jsx`**
    *   **The User Journey:** When a logged-in user hits the home page, this component loads. 
    *   **Under the Hood:** Immediately upon loading (using a `useEffect` hook), it calls `fetchDecisions()` from the API client. While it waits for the server, it displays a spinning `Loader` component. Once the server replies with a list of 50 decisions, React loops through that list and renders a small `DecisionCard` component for each one, arranging them in a neat grid.

### The Authoring Tool (Creation)
*   **`frontend/src/pages/CreateDecision.jsx`**
    *   **The User Journey:** The user types a Title (e.g., "Where should we host the holiday party?"), a long description, and decides if it should be PUBLIC or PRIVATE. 
    *   **Dynamic Poll Options:** The form is highly dynamic. The user can click "Add Option" to spawn a new text box for a poll choice (e.g., "Office", "Restaurant", "Park"). React manages this array of options in memory.
    *   **The Payload:** When submitted, `axiosClient.js` bundles this complex, multi-layered data into a massive JSON object and POSTs it to the backend.

### The Expanded View (Details & Deletion)
*   **`frontend/src/pages/DecisionDetails.jsx`**
    *   **The User Journey:** When a user clicks a card on the dashboard, they are taken here.
    *   **The Magic Button:** The component fetches the decision details. It then checks the global `AuthContext` to see the currently logged-in user's ID. It compares that to the `owner_id` attached to the decision. **If they match**, React magically renders a red "Delete" button. If they don't match, the button remains hidden.
    *   **The Action:** Clicking "Delete" calls `deleteDecisionApi`, waits for a success message, and then automatically redirects the user back to the dashboard.

---

## 2. The Backend Engine (Java Spring Boot)

### The Receptionist (Controller)
*   **`backend/src/main/java/com/decisionhub/controller/DecisionController.java`**
    *   **The Hand-off:** Receives the massive JSON object and maps it to a `DecisionRequest` DTO (Data Transfer Object).
    *   **Security Context Extraction:** Before doing anything, it looks at the security context (established by the `JwtFilter`) to securely identify the exact email address of the person making the request. It passes this email to the Service layer so the backend never has to trust the frontend to tell it who is making the request.

### The Business Logic (Service)
*   **`backend/src/main/java/com/decisionhub/service/DecisionService.java`**
    *   **Creation Orchestration:** This is a complex operation. 
        1. It looks up the User in the database using the email.
        2. It creates a new `Decision` Java object and attaches the User to it as the owner.
        3. If the incoming request contains a list of poll options, it doesn't stop there. It creates a `Poll` Java object and attaches it to the Decision.
        4. It then loops through the text options, creating a `PollOption` object for each one, and attaches them to the Poll.
        5. Finally, it tells the database to save this massive web of connected objects in one fell swoop.
    *   **Deletion Protection:** If a delete request comes in, the service fetches the decision. It checks the decision's owner email against the requester's email. If a malicious user somehow bypassed the hidden frontend button and sent a raw delete request, the backend will catch it here and throw an `AccessDeniedException`.

---

## 3. The Database Ledger (MySQL)

### The `decisions` Table
*   **Entity File:** `backend/src/main/java/com/decisionhub/entity/Decision.java`
*   **What a row looks like in practice:**

| id | title | description | visibility | status | owner_id | community_id | views | is_deleted |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 42 | Where to eat? | Let's decide... | PUBLIC | OPEN | 1 | NULL | 150 | FALSE |

### The `polls` and `poll_options` Tables
*   Because relational databases like MySQL cannot store a list of items inside a single spreadsheet cell, the backend's "creation orchestration" results in rows being created across three different tables:
    *   Table `polls` gets a row: `id=99, decision_id=42`
    *   Table `poll_options` gets row 1: `id=200, poll_id=99, text="Office"`
    *   Table `poll_options` gets row 2: `id=201, poll_id=99, text="Restaurant"`

### Known Issues & Technical Debt
*   **The N+1 Query Problem:** In `Decision.java`, the `owner_id` is mapped with an instruction called `FetchType.EAGER`. This means whenever the Dashboard asks the database for 50 decisions, Hibernate (the database manager) executes 1 query to get the decisions, and then executes **50 separate queries** to fetch the profile picture and name of every single owner. This is incredibly inefficient and will slow the dashboard down to a crawl as the platform gets popular.
*   **Fake Soft Deletes:** The table has an `is_deleted` column. This implies that when a user clicks "Delete", the row is simply hidden, not destroyed. However, the Java Entity lacks the special `@SQLDelete` annotation required to make this work. Currently, clicking delete executes a permanent hard-delete, erasing the data forever.
