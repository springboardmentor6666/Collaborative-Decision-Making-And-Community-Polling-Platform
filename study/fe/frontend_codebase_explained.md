# The Complete Frontend File Dictionary (Detailed Edition)

This document provides a highly detailed, comprehensive guide to **every single file** in the frontend (`src/`) folder. It is written specifically for those without a coding background, using analogies and step-by-step scenarios to explain the exact purpose, existence, and mechanics of the user interface.

---

## 1. The Core Application Engine (Root Files)
These files act as the engine of the car. Without them, none of the other screens or buttons can function. They set up the environment that allows the web application to run inside the user's browser.

*   **`main.jsx`**: 
    *   **What it does:** This is the absolute starting point of the application. When a user navigates to your website, the browser downloads this file first. 
    *   **How it works:** It takes all the React code (which is just a bunch of JavaScript instructions) and forcibly attaches it to a single invisible box (an HTML `div` with the id "root") on the web page. It also wraps the entire application in important providers, like the `AuthContext` (to remember who is logged in) and the Theme provider.
*   **`App.jsx`**: 
    *   **What it does:** This file acts as the "Traffic Cop" or "Router". 
    *   **How it works:** In traditional websites, clicking a link downloads a brand new HTML page from the server. This app is a "Single Page Application" (SPA). `App.jsx` watches the web address bar (the URL). If the user types `/login`, `App.jsx` instantly swaps out the screen to show the `LoginPage.jsx` file without ever refreshing the browser. It contains a massive list of rules linking web addresses to specific Page files.
*   **`index.css`**: 
    *   **What it does:** The master styling rulebook.
    *   **How it works:** It contains the base CSS (Cascading Style Sheets) rules for the entire application. It defines the default fonts, resets browser margins so the app looks identical on Chrome and Safari, and imports the TailwindCSS framework which allows developers to style buttons and text very quickly.

---

## 2. API Communication (`src/api/`)
This folder contains the files responsible for talking to the outside world (the Backend).

*   **`axiosClient.js`**: 
    *   **The Analogy:** Think of this file as **The Messenger** or the **Postal Service**. 
    *   **Why it exists:** Frontend React code runs inside the user's browser (e.g., on their laptop in New York). The database lives on a secure server (e.g., in a data center in Virginia). They cannot read each other's minds. When the frontend needs data, it must send an HTTP request over the internet.
    *   **What it does:** This file contains a dedicated function for every single action the user can take. 
        *   If a user clicks "Login", the page calls `loginApi(email, password)` from this file. 
        *   This file packages that email and password into a digital envelope (JSON), stamps it with the destination address (`http://localhost:8080/api/auth/login`), and sends it. 
    *   **The Secret Feature:** This file has an "interceptor". If the user is logged in, they are given a digital ID badge (a JWT Token). `axiosClient.js` automatically intercepts every outgoing envelope and staples the user's ID badge to it, so the backend knows who is making the request without the user having to log in repeatedly.

---

## 3. Global State Memory (`src/context/`)
*   **`AuthContext.jsx`**: 
    *   **The Problem it Solves:** In React, passing information from the top of the app down to a deeply buried button is difficult (this is called "prop drilling"). If the `Navbar` needs to know the user's name, and the `VotePage` needs to know the user's ID, you need a central memory bank.
    *   **What it does:** This file creates a "Global Cloud" of memory. When `axiosClient.js` successfully logs a user in, it saves their details to the browser's hard drive (`localStorage`). `AuthContext.jsx` reads that hard drive and broadcasts the user's profile to every single file in the app. Any file can simply ask `useAuth()` and instantly know if the user is a guest or an authenticated member.

---

## 4. Theme & Layout (`src/theme/` & `src/layouts/`)
*   **`theme.css` / `themes.js` / `useTheme.js` / `ThemeProvider.jsx`**: 
    *   **What they do:** These files collectively manage the "paint job" of the application. They define a strict color palette (primary colors, background colors, text colors) so that the app looks professional and consistent. They also include the logic to let a user toggle between "Light Mode" (white backgrounds) and "Dark Mode" (black backgrounds).
*   **`MainLayout.jsx`**: 
    *   **What it does:** This is a physical wrapper or frame. Instead of forcing every single Page file to manually import the top `Navbar` and the bottom `Footer`, this layout file surrounds the changing content. The middle part of the layout swaps out depending on the URL, but the top and bottom remain static.

---

## 5. The Full-Screen Pages (`src/pages/`)
These files represent the actual full screens that fill the user's monitor.

*   **Authentication Screens:**
    *   **`LoginPage.jsx` & `SignupPage.jsx`**: The entry gates. They contain input boxes for email and password. When the user types and hits submit, these files validate the text (e.g., making sure the email has an "@" symbol) and then call `axiosClient.js` to attempt entry.
    *   **`ForgotPasswordPage.jsx`**: A screen designed to ask for an email to send a password reset link. *(Note: This currently hits a dead end because the backend lacks the corresponding receiver).*
*   **Discovery Screens:**
    *   **`DashboardPage.jsx`**: The main feed. When it loads, it asks the backend for a list of all active topics. It then uses a loop to stamp out a visual `DecisionCard` for every topic returned by the database.
    *   **`CommunitiesPage.jsx`**: A directory screen listing all available groups (like "Engineers" or "Book Club"). It includes a search bar that filters the list of groups.
*   **Creation Screens:**
    *   **`CreateDecision.jsx`**: A complex form. It allows the user to type a topic title, write a long description, and dynamically click "Add Option" to create as many poll choices as they want. When they hit submit, it packages all this into a massive JSON envelope and sends it to the backend.
    *   **`CreateCommunity.jsx`**: A simple form to establish a new workspace or group, setting its name and description.
*   **Detail & Interaction Screens:**
    *   **`DecisionDetails.jsx`**: The expanded view of a single topic. It shows the full text, who created it, and when. If the person looking at the page is the same person who created it, a "Delete" button magically appears.
    *   **`VotePage.jsx`**: The most critical interactive screen. It renders the poll choices. It checks the user's history; if they already voted, it locks the buttons. If not, it allows them to select a choice, submits it to the backend, and then immediately reveals the `ResultChart`.
    *   **`CommunityDetails.jsx`**: The hub for a specific group. It asks the backend for three things: the group's info, the list of members, and the list of private decisions that belong only to this group. It also contains "Join" or "Leave" buttons.
*   **Analytics Screens:**
    *   **`AnalysisPage.jsx`**: A personal dashboard. It shows the user every vote they have ever cast. It does math to compare their choice against the majority choice to tell them if they "won" or "lost" the poll.
    *   **`AnalyticsPage.jsx`**: A dashboard for creators. If you create a poll, this page shows you how many total views it got, how many people voted, and calculates the engagement percentage.
*   **Utility Screens:**
    *   **`Profile.jsx`**: Shows the user's personal account details and avatar.
    *   **`ContactSupport.jsx` / `PrivacyPolicy.jsx` / `TermsConditions.jsx`**: Static pages containing legal text and contact info.
    *   **`NotFound.jsx`**: The classic "404 Error" page. If a user types `www.website.com/gibberish`, the router (`App.jsx`) realizes no page matches "gibberish" and shows this screen instead.

---

## 6. Reusable Building Blocks (`src/components/`)
If Pages are the finished house, Components are the bricks and windows used to build them. They are written once and used everywhere to save time.

*   **Structural Components:**
    *   **`Navbar.jsx`**: The top menu bar. It contains links to Home, Analytics, and the Logout button.
    *   **`IconSidebar.jsx` & `Sidebar.jsx`**: Vertical navigation menus used on the left side of desktop screens.
    *   **`Footer.jsx`**: The bottom bar containing copyright info and links to the Privacy Policy.
*   **Feature Components:**
    *   **`PollCard.jsx`**: The specific white box that holds the radio buttons (options) for a poll. Separating this from the `VotePage` makes the code cleaner and easier to read.
    *   **`DecisionCard.jsx` & `CommunityCard.jsx`**: The small preview boxes (thumbnails) shown in the Dashboard feed. They take a large chunk of data and format it into a neat little square with a title, snippet, and icon.
    *   **`ResultChart.jsx`**: The visual component that draws colored bars representing the vote tallies. It calculates percentages so a bar with 100 votes is visually twice as long as a bar with 50 votes.
    *   **`VoteButton.jsx`**: A heavily styled submit button specifically for finalizing a vote.
*   **Utility & UI Components:**
    *   **`ProtectedRoute.jsx`**: A "security guard". You wrap private pages (like the Dashboard) in this component. Before it lets the page load, it checks `AuthContext` to see if the user has an ID badge. If not, it kicks them back to the login screen.
    *   **`Loader.jsx` / `PageTransition.jsx`**: These display spinning circles or smooth fading animations when the app is waiting for the backend to reply. This prevents the user from thinking the website is frozen.
    *   **`AuthPageShell.jsx`**: A decorative background graphic specifically used to make the Login and Signup forms look pretty.
    *   **`BrandMark.jsx`**: The website's logo graphic, extracted to a component so it can be changed in one place and update everywhere.
    *   **`ui/Button.jsx`, `ui/Card.jsx`, `ui/Input.jsx`, `ui/PageContainer.jsx`**: The absolute smallest building blocks. Instead of styling every single text box in the app individually, developers style `Input.jsx` once, and use it 50 times across the app to ensure every text box looks perfectly identical.

---

## 7. The Unused Graveyard (`src/services/`)
This entire folder represents "Technical Debt"—code that was left behind after a major architectural change.

*   **`api.js`, `authService.js`, `decisionService.js`, `pollService.js`, `userService.js`, `voteService.js`**: 
    *   **Why they exist:** In an older version of this application, developers used a third-party library called `axios` to talk to the backend, and they split the functions into these six different files based on category.
    *   **Why they are dead:** Later, a developer rewrote the entire networking system to use the browser's native `fetch` tool, condensing everything into the single `api/axiosClient.js` file we use today. However, they forgot to delete these old files. 
    *   **What they do:** Absolutely nothing. No file in the application currently imports or executes them. They can be safely deleted to clean up the project.
