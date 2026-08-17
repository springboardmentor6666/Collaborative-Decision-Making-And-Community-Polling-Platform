# Feature Deep Dive: Analytics & Impressions

This document provides a highly detailed, beginner-friendly explanation of how the platform tracks user behavior, calculates engagement metrics, and builds personalized voting history reports.

---

## 1. The Frontend Experience (React)

### The Invisible Tracker (Fire-and-Forget)
*   **`frontend/src/pages/DecisionDetails.jsx`**
    *   **The Action:** Whenever a user clicks on a decision to read it, you want to record that as a "View" (an impression).
    *   **The Silent Ping:** The moment the page loads, React executes a `recordImpressionApi` call to the backend. This is known as a "fire-and-forget" request. The frontend sends the ping, but it doesn't wait for a response or show a loading spinner. If the ping fails (e.g., bad internet), it doesn't crash the page; it just silently ignores the failure, because reading the content is more important than tracking the metric.

### The Personal History (My Votes Analysis)
*   **`frontend/src/pages/AnalysisPage.jsx`**
    *   **The User Journey:** A user wants to see all the polls they've ever voted on to see if they are in the majority or minority.
    *   **The Visualization:** This page fetches a massive, pre-calculated list from the backend. For every poll, it shows the user's choice side-by-side with the ultimate winning choice. It uses color-coding (e.g., green for a match, red for a mismatch) to visually indicate if the user "won" the debate.

### The Creator Dashboard (AnalyticsPage)
*   **`frontend/src/pages/AnalyticsPage.jsx`**
    *   **The Dashboard:** For users who create decisions, this page aggregates all their data. It takes the raw statistics provided by the backend and builds visual charts showing "Total Views", "Total Votes", and calculates an "Engagement Rate" (Votes divided by Views).

---

## 2. The Backend Engine (Java Spring Boot)

### The Traffic Cop (AnalyticsController)
*   **`backend/src/main/java/com/decisionhub/controller/AnalyticsController.java`**
    *   **IP Extraction:** When the "Silent Ping" arrives to record a view, this controller does something unique. It reaches into the raw HTTP network data (`HttpServletRequest`) to extract the user's IP Address (their computer's unique internet routing number). It does this so it can track views even if the user is anonymous (not logged in).

### The Statistician (AnalyticsService)
*   **`backend/src/main/java/com/decisionhub/service/AnalyticsService.java`**
    *   **Spam Prevention:** If a user refreshes the page 100 times in 10 seconds, you don't want to record 100 views. Before saving the impression, this service checks the database: "Did an impression from this specific IP Address occur on this specific Decision in the last hour?" If yes, it ignores the new ping. If no, it saves it and increments the official view counter.
    *   **The Math Heavyweight:** When generating the "My Votes" report, this service does heavy lifting. It fetches every single vote the user ever cast. For each one, it then fetches all the *other* votes on that poll, calculates the current winner, compares the user's choice to the winner, packages all of this complex logic into a clean `MyVoteAnalysisDto` container, and sends it to the frontend.

---

## 3. The Database Ledger (MySQL)

### The Event Log (`decision_impressions`)
*   **Entity File:** `backend/src/main/java/com/decisionhub/entity/DecisionImpression.java`
*   **The Design:** This table is an append-only event log. It never deletes data. 
*   **What it looks like in practice:**

| id | decision_id | user_id | ip_address | type | timestamp |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 42 | 15 | 192.168.1.5 | VIEW | 10:00:00 |
| 2 | 42 | NULL | 10.0.0.99 | VIEW | 10:05:00 |

*   *(Notice how row 2 has a NULL `user_id`. That means a guest without an account viewed the page, but we still tracked them via their IP address).*

### The Denormalization Trick (The `views` column)
*   **The Problem:** If you want to show the total views on a decision, you could tell the database: `COUNT(*)` (count all rows) in the `decision_impressions` table where `decision_id = 42`. But if a decision has a million views, counting a million rows every time the page loads takes too long.
*   **The Solution:** Denormalization. The main `decisions` table has a dedicated `views` integer column. When the Analytics Service records a new valid impression in the log table, it also sends a quick command to the `decisions` table: `UPDATE decisions SET views = views + 1`. This way, reading the total view count is instantaneous, because the math is already done.
