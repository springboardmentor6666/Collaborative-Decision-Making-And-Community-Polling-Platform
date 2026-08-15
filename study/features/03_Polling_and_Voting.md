# Feature Deep Dive: Polling & Voting

This document provides a highly detailed, comprehensive guide to the most critical interactive feature of the platform: how polls are displayed, how users cast votes, and how the results are mathematically tallied and protected against cheating.

---

## 1. The Frontend Experience (React)

### The Voting Booth (VotePage & PollCard)
*   **`frontend/src/pages/VotePage.jsx` & `frontend/src/components/PollCard.jsx`**
    *   **The User Journey:** When a user decides they want to vote on a decision, they land on this page.
    *   **The Pre-Check:** Before the user is even allowed to see the options, the page silently calls the backend (`getMyVotesAnalysisApi`) to ask: "Has this specific user already voted on this specific poll?"
    *   **The Lockout:** If the answer is yes, the page alters its appearance. It pre-selects the option the user previously chose, grays out all the buttons so they cannot be clicked, and displays a message saying "You have already voted."
    *   **The Interaction:** If they haven't voted, `PollCard.jsx` displays a standard list of radio buttons. React keeps track of which button is currently selected in its temporary memory.
    *   **The Submission:** The user clicks the final "Submit Vote" button. The frontend calls `castVoteApi(pollId, selectedOptionId)` and waits.

### The Live Results (ResultChart)
*   **`frontend/src/components/ResultChart.jsx`**
    *   **The Reveal:** The instant `castVoteApi` returns a "Success" message, the `VotePage` fires off a second, immediate request to the backend: `getVoteResultsApi`.
    *   **The Visualization:** The backend returns raw numbers (e.g., Option A: 50 votes, Option B: 25 votes). `ResultChart.jsx` takes those raw numbers, calculates the percentages (Option A is 66%), and draws visually appealing bar charts or pie charts on the screen so the user can instantly see the impact of their vote.

---

## 2. The Backend Engine (Java Spring Boot)

### The Receptionist (VoteController)
*   **`backend/src/main/java/com/decisionhub/controller/VoteController.java`**
    *   **What it does:** It listens on `/api/votes`. When a vote request comes in, it strips the user's email out of their security badge (JWT) and passes the email, the `pollId`, and the `optionId` to the Service layer.

### The Integrity Auditor (VoteService)
*   **`backend/src/main/java/com/decisionhub/service/VoteService.java`**
    *   **The Most Important Rule:** This service is responsible for election integrity. Even though the frontend tries to lock the voting buttons if a user has already voted, a malicious hacker could easily bypass the frontend and send a raw HTTP request to vote 10,000 times.
    *   **The Defense:** Before saving a vote, the `VoteService` asks the database a direct question: `voteRepository.existsByPollIdAndVoterId()`. It checks if this specific human has ever voted on this specific poll. If the answer is yes, it throws a `DuplicateVoteException` (HTTP 409 Conflict error), utterly blocking the hacker.
    *   **The Tallying Machine:** When the frontend asks for results, this service doesn't just return a pre-calculated number. It goes to the database, fetches **every single vote ever cast** for that poll, and uses Java Streams (a highly efficient way to process lists of data in memory) to group the votes by option and count them up in real-time. It then packages this data into a `VoteResultResponse` DTO and ships it back.

---

## 3. The Database Ledger (MySQL)

### The `votes` Table (The Ledger)
*   **Entity File:** `backend/src/main/java/com/decisionhub/entity/Vote.java`
*   **The Design:** The database doesn't store a simple "Option A has 5 votes" counter. If it did, and the counter got corrupted, the data would be lost forever. Instead, the database acts as an immutable ledger, recording every single individual vote as its own separate row.
*   **What the ledger looks like in practice:**

| id | poll_id | poll_option_id | voter_id | created_at |
| :--- | :--- | :--- | :--- | :--- |
| 1001 | 99 | 200 | 1 | 2024-05-10 14:31:00 |
| 1002 | 99 | 201 | 2 | 2024-05-10 14:35:00 |
| 1003 | 99 | 200 | 3 | 2024-05-10 14:40:00 |

### How Tallying Works Structurally
When the `VoteService` asks for the results for Poll #99, the `VoteRepository` executes a SQL query that looks like this:
`SELECT * FROM votes WHERE poll_id = 99`

It pulls those three rows into the backend's RAM. The Java code looks at them and says: "I see two rows for `poll_option_id=200`, and one row for `poll_option_id=201`. Therefore, Option 200 is winning 2 to 1." 

This ledger system ensures perfect accuracy and allows for future features like "Vote Auditing" (letting a user see exactly when they voted) which would be impossible if the database only stored raw totals.
