# Feature Deep Dive: The Dormant Code (Technical Debt)

This document provides a highly detailed explanation of the "ghost town" inside the application. These are fully fleshed-out features that have been perfectly built in the backend and database, but are completely invisible to the user because the frontend developers never built the buttons or screens to access them.

---

## 1. The "Plumbing Without a Faucet" Analogy
Imagine a house where the plumber installed perfect pipes for a new bathroom sink. The pipes are connected to the water main, they don't leak, and they are fully pressurized. However, the builder forgot to install the actual sink and faucet on the wall. 

In this application:
*   The **Database Tables** are the water main. They exist and are ready to store data.
*   The **Backend Controllers & Services** are the pipes. They have all the logic perfectly written to route the data safely.
*   The **Frontend UI (React)** is the faucet. Because the UI screens and buttons were never built, the user can never turn on the feature. The pipes sit completely unused.

---

## 2. The Unused Features Breakdown

### A. The Categories System
*   **The Goal:** Allow users to tag decisions with categories (e.g., "Technology", "Politics") so they can filter the dashboard to only see topics they care about.
*   **The Backend Pipes:** `CategoryController.java` is fully written and exposes an endpoint at `/api/categories`. The `CategoryService.java` is ready to process the tags.
*   **The Database Main:** The `categories` table and the `user_interests` junction table exist and are completely empty.
*   **The Missing Faucet:** The frontend `CreateDecision.jsx` needs a dropdown menu added to it that allows a user to select a category before hitting submit.

### B. Comments & Discussion Threads
*   **The Goal:** Allow users to debate and leave text comments underneath a decision, separate from the actual poll voting buttons.
*   **The Backend Pipes:** `CommentController.java` (`/api/comments`) is ready to receive text comments, link them to the correct user, and link them to the correct decision.
*   **The Database Main:** The `comments` table exists and is completely empty.
*   **The Missing Faucet:** The frontend `DecisionDetails.jsx` needs a text box added to the bottom of the page that says "Leave a comment...", along with a list that displays previous comments.

### C. Content Moderation (Flagging)
*   **The Goal:** Allow users to report inappropriate decisions or comments (spam, abuse) to the administrators for review.
*   **The Backend Pipes:** `ModerationController.java` (`/api/moderation`) is fully built. It takes the ID of the bad post and the reason for the report, and passes it to the `ModerationService`.
*   **The Database Main:** The `moderation_flags` table is ready to act as an inbox for the admins, storing the `reason` and `status` (e.g., "PENDING_REVIEW").
*   **The Missing Faucet:** The frontend needs a tiny red flag icon added to every `DecisionCard`. When clicked, it should open a popup asking "Why are you reporting this?", and then send that answer to the backend.

### D. User Notifications (Alerts)
*   **The Goal:** An in-app alert system. For example, if User A votes on a poll created by User B, the system should generate a notification for User B saying "Someone voted on your poll!"
*   **The Backend Pipes:** `NotificationController.java` (`/api/notifications`) is ready to hand over a list of unread alerts to whoever asks.
*   **The Database Main:** The `notifications` table is ready to store the `message`, a boolean flag for `is_read`, and the `recipient_id`.
*   **The Missing Faucet:** The frontend `Navbar.jsx` needs a little "Bell" icon added to it. When clicked, it should call the backend, fetch the list of alerts, and display them in a dropdown menu.

---

## 3. How a Developer Would "Turn on the Faucet"

If a new developer is hired to finish these features, they do not need to touch the Java Backend or the MySQL Database. All the work is on the Frontend.

To activate the "Comments" feature, the developer would simply:
1.  Open the frontend's messenger file: `frontend/src/api/axiosClient.js`.
2.  Write a new function called `postCommentApi(text, decisionId)` that sends a POST request to `http://localhost:8080/api/comments`.
3.  Open `frontend/src/pages/DecisionDetails.jsx`.
4.  Write the React code to draw a text box and a "Submit" button on the screen.
5.  Link the "Submit" button so that when clicked, it triggers the `postCommentApi` function they just wrote. 

Once that connection is made, the data will flow through the existing backend pipes directly into the existing database tables, and the feature will instantly come to life!
