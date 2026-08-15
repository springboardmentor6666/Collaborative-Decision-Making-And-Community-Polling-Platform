# Feature Deep Dive: Authentication & User Management

This document provides a highly detailed, step-by-step breakdown of how the Authentication (Login, Register, Logout) and User Profile features are implemented across the entire software stack.

---

## 1. The Frontend Experience (React)

### The User Interface (Pages)
*   **`frontend/src/pages/LoginPage.jsx` & `frontend/src/pages/RegisterPage.jsx`**
    *   **The User Journey:** When a user lands on the site, they are presented with these screens. The `RegisterPage` asks for a Full Name, Email, and Password. 
    *   **Under the Hood:** As the user types, React constantly updates its internal memory (State) to match the text boxes. Before the form even tries to contact the server, it runs "Client-Side Validation"—it checks if the password is too short, or if the email is missing an `@` symbol. If it fails, it shows a red error message instantly without wasting network resources.

### The Network Messenger (API Client)
*   **`frontend/src/api/axiosClient.js` (Functions: `loginApi`, `registerApi`)**
    *   **The Action:** Once the user clicks "Submit" and the form is valid, the Page hands the email and password over to this file. 
    *   **The Payload:** This file bundles the data into a digital JSON package that looks like this: `{"email": "john@doe.com", "password": "MySecretPassword123"}`. It sends this via an HTTP `POST` request to the backend.

### The Global Brain (Context)
*   **`frontend/src/context/AuthContext.jsx`**
    *   **The Aftermath:** If the backend accepts the login, it sends back a digital VIP pass (a JWT Token). The `loginApi` takes this token and saves it directly to the browser's hard drive (Local Storage).
    *   **The Broadcast:** Immediately after, `AuthContext.jsx` wakes up. It sees the new token on the hard drive, decodes it to find the user's name, and broadcasts a message to the entire app saying: "John Doe is now logged in." The `Navbar` hears this broadcast and instantly changes the "Login" button into a "Logout" button.

---

## 2. The Backend Engine (Java Spring Boot)

### The Receptionist (Controller)
*   **`backend/src/main/java/com/decisionhub/controller/AuthController.java`**
    *   **The Hand-off:** This file receives the JSON package from the frontend. It uses a DTO (Data Transfer Object) called `LoginRequest` to map the incoming JSON into Java variables.
    *   **Spring Validation:** Before processing, it checks if the email is blank. If it is, it rejects it immediately with a 400 Bad Request error.

### The Business Logic (Service)
*   **`backend/src/main/java/com/decisionhub/service/UserService.java`**
    *   **For Registration:** It asks the `UserRepository`: "Does this email already exist?" If yes, it throws a `UserAlreadyExistsException`. If no, it takes the plaintext password ("MySecretPassword123") and uses a complex mathematical algorithm (BCrypt / `LegacyPasswordEncoder`) to scramble it into gibberish (e.g., `$2a$10$wK...`). It then saves the User object to the database.
    *   **For Login:** It asks the database for the user with that email. It takes the password the user just typed, scrambles it using the same math, and checks if the two scrambled strings match. (The backend *never* unscrambles the password; it just checks if the scrambled versions match).

### The Security Guards (Security Layer)
*   **`backend/src/main/java/com/decisionhub/security/JwtUtil.java` & `JwtFilter.java`**
    *   **Issuing the Badge:** Once `UserService` confirms the password is correct, `JwtUtil` generates the JWT Token. It signs it with a secret key stored in the server's configuration file.
    *   **Checking the Badge:** For every subsequent request the user makes (e.g., trying to vote), `JwtFilter` acts as a bouncer. It rips the token out of the HTTP header, uses the secret key to verify nobody forged or tampered with it, and lets the request pass through.

---

## 3. The Database Ledger (MySQL)

### The `users` Table
*   **Entity File:** `backend/src/main/java/com/decisionhub/entity/User.java`
*   **What a row looks like in practice:**

| id | email | password_hash | full_name | role | is_active | created_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | john@doe.com | $2a$10$wKhJ... | John Doe | USER | TRUE | 2024-05-10 14:30:00 |

*   **Crucial Design Detail:** Notice that the `password_hash` column is storing the scrambled text, not the actual password. If a hacker breaches the database, they cannot read anyone's passwords.

---

## 4. Known Issues & Unfinished Business (Technical Debt)

The frontend `axiosClient.js` contains functions for `resetPasswordApi` and `logoutApi`, but these are "phantom limbs".
*   **Password Reset:** The UI screen for "Forgot Password" exists, and it attempts to send an email to the backend. However, the backend `AuthController.java` **does not have any code written to receive it**. It will simply return a "404 Not Found" error.
*   **Logout Invalidation:** The frontend successfully deletes the JWT token from the browser's hard drive when you click logout. However, the token itself is still valid until its natural expiration time. The backend does not currently have a "Token Blocklist" implemented to forcefully invalidate a token if it was stolen.
