# DecisionHub — Frontend Web Application Specification (`/frontend`)

The **DecisionHub Frontend** is a modern Single Page Application (SPA) built with **React 18**, **Vite 5**, **Tailwind CSS**, **Framer Motion**, and **SockJS / STOMP.js**. It features a glassmorphism design system, multi-criteria decision matrices, real-time threaded chat, animated SVG charting, and keyboard shortcuts.

---

## 📁 Component & Directory Architecture

```
frontend/
├── Dockerfile                      # Multi-stage Node builder + Nginx production container
├── index.html                      # HTML5 entry point & typography fonts
├── nginx.conf                      # Production Nginx reverse proxy & SPA router config
├── package.json                    # NPM packages & build scripts
├── postcss.config.js               # PostCSS Tailwind preprocessor
├── tailwind.config.js              # Theme tokens, custom colors, glassmorphism utilities
├── vite.config.js                  # Vite 5 dev server, build options & proxy mappings
└── src/
    ├── main.jsx                    # React DOM root renderer
    ├── App.jsx                     # Top-level routing coordinator & layout providers
    ├── index.css                   # Global design tokens, animations & utility classes
    ├── api/
    │   └── axiosClient.js          # Central HTTP client (JWT auth header injection, refresh interceptors)
    ├── components/                 # Reusable UI component library (27 components)
    │   ├── AdminRoute.jsx          # Route guard restricting access to ADMIN role
    │   ├── AlertPopup.jsx          # Modal confirmation & action alert dialog
    │   ├── AuthPageShell.jsx       # Layout wrapper for authentication screens
    │   ├── BrandMark.jsx           # SVG vector brand logo with responsive sizing
    │   ├── CategoryBadge.jsx       # Themed, color-coded category tags
    │   ├── CategorySelector.jsx    # Interactive category picker
    │   ├── CommandMenu.jsx         # Keyboard-driven command palette (Cmd+K / Ctrl+K)
    │   ├── CommentItem.jsx         # Threaded comment with nested replies & reactions
    │   ├── CommentSection.jsx      # Discussion thread manager with sorting
    │   ├── CommunityCard.jsx       # Community hub preview card with join/leave actions
    │   ├── ComparisonMatrix.jsx    # Multi-Criteria Decision Analysis (MCDA) factor scoring table
    │   ├── DecisionCard.jsx        # Decision feed card with status badges & bookmarks
    │   ├── ErrorBoundary.jsx       # React error boundary catching rendering failures
    │   ├── Footer.jsx              # Application footer with navigation links & status
    │   ├── IconSidebar.jsx         # Right-edge quick utility & notification rail
    │   ├── InterestTaxonomyEditor.jsx # User onboarding interest category selector
    │   ├── Loader.jsx              # Animated spinner, skeleton & loading states
    │   ├── Navbar.jsx              # Main navigation bar with search & notification drawer
    │   ├── NotificationBell.jsx    # Notification trigger with unread badge counter
    │   ├── PageTransition.jsx      # Framer Motion page transition wrapper
    │   ├── PieChart.jsx            # Custom animated SVG donut & pie chart
    │   ├── PollCard.jsx            # Interactive poll ballot (Single, Multi, Rating, IRV)
    │   ├── ProtectedRoute.jsx      # Auth guard redirecting unauthenticated users to /login
    │   ├── ReportModal.jsx         # Content moderation reporting dialog
    │   ├── ResultChart.jsx         # Animated horizontal/vertical vote distribution chart
    │   ├── Sidebar.jsx             # Left desktop navigation drawer
    │   └── VoteButton.jsx          # Animated interactive voting button
    ├── components/activity/        # Activity feed components
    │   ├── ActivityItemCard.jsx    # Polymorphic activity item renderer
    │   └── RecentActivityFeed.jsx  # Live activity feed panel
    ├── components/chat/            # Real-time WebSocket chat components
    │   ├── ChatChannelSidebar.jsx  # Channel switcher (#general, #announcements)
    │   ├── ChatComposer.jsx        # Rich message input with emoji picker
    │   ├── ChatMessageItem.jsx     # Individual chat message with thread replies
    │   ├── ChatMessageStream.jsx   # Scrollable chat message stream with infinite scroll
    │   ├── ChatReactionPicker.jsx  # Emoji reaction selector popup
    │   └── CommunityChatTab.jsx    # Integrated community chat tab coordinator
    ├── components/ui/              # Design system primitives
    │   ├── Button.jsx              # Core button primitive (variants: primary, ghost, danger)
    │   ├── Card.jsx                # Glassmorphism container surface
    │   ├── Input.jsx               # Text input, textarea, and form field
    │   ├── MarkdownEditor.jsx      # Markdown editor & live preview
    │   ├── PageContainer.jsx       # Responsive max-width page shell
    │   ├── SkeletonCard.jsx        # Skeleton placeholder for feed items
    │   └── Toast.jsx               # Floating toast notification component
    ├── context/                    # React Context State Providers
    │   ├── AlertContext.jsx        # Global modal alerts and confirmation dialogs
    │   ├── AuthContext.jsx         # User session, JWT lifecycle, Google OAuth2
    │   ├── RefreshContext.jsx      # Cross-component refresh coordinator
    │   └── ToastContext.jsx        # Global toast notification queue
    ├── hooks/                      # Custom React Hooks
    │   ├── useCommunityChat.js     # WebSocket STOMP real-time chat lifecycle hook
    │   └── useKeyboardShortcuts.js # Global keyboard shortcuts (Ctrl+K, Esc, '/')
    ├── layouts/
    │   └── MainLayout.jsx          # Top-level authenticated layout coordinator
    ├── pages/                      # 25 Route View Components
    │   ├── AdminPage.jsx           # /admin — Platform management & user roles
    │   ├── AdminReportsPage.jsx    # /admin/reports — Moderation queue
    │   ├── AdminStatisticsPage.jsx # /admin/statistics — Platform metrics
    │   ├── AnalysisPage.jsx        # /analysis — User vote analysis & outcomes
    │   ├── AnalyticsPage.jsx       # /analytics — Creator reach & conversion metrics
    │   ├── CommunitiesPage.jsx     # /communities — Community hub directory
    │   ├── CommunityDetails.jsx    # /communities/:id — Group decisions & live chat
    │   ├── CommunityReportsPage.jsx# /communities/:id/reports — Community moderation
    │   ├── ContactSupport.jsx      # /contact-support — Support inquiry form
    │   ├── CreateCommunity.jsx     # /communities/create — Community creator
    │   ├── CreateDecision.jsx      # /decisions/create — Decision & poll creator
    │   ├── DashboardPage.jsx       # /dashboard — Main feed & activity stream
    │   ├── DecisionDetails.jsx     # /decisions/:id — MCDA matrix & poll discussion
    │   ├── DecisionReportPage.jsx  # /decisions/:id/report — Exportable decision summary
    │   ├── EditDecision.jsx        # /decisions/:id/edit — Decision editor
    │   ├── ForgotPasswordPage.jsx  # /forgot-password — Password recovery request
    │   ├── LoginPage.jsx           # /login — User login & Google OAuth2
    │   ├── NotFound.jsx            # 404 Not Found fallback view
    │   ├── OnboardingWizard.jsx    # /onboarding — Post-signup interest taxonomy
    │   ├── PrivacyPolicy.jsx       # /privacy-policy — Privacy terms
    │   ├── Profile.jsx             # /profile — User profile, stats & bookmarks
    │   ├── ResetPasswordPage.jsx   # /reset-password — Set new password with token
    │   ├── SignupPage.jsx          # /signup — User registration
    │   ├── TermsConditions.jsx     # /terms-conditions — Terms of service
    │   └── VotePage.jsx            # /decisions/:id/vote — Ballot voting interface
    ├── services/                   # API wrapper services
    │   ├── api.js                  # Axios base client
    │   ├── authService.js          # Authentication API functions
    │   ├── decisionService.js      # Decision board CRUD API functions
    │   ├── notificationService.js  # Notifications API functions
    │   ├── pollService.js          # Polls & tallies API functions
    │   ├── userService.js          # User profile & bookmark API functions
    │   └── voteService.js          # Vote casting & IRV analysis API functions
    ├── theme/
    │   ├── ThemeProvider.jsx       # Theme state provider
    │   ├── theme.css               # CSS custom properties per theme
    │   ├── themes.js               # Theme token constants
    │   └── useTheme.js             # Theme switcher hook
    └── utils/
        ├── errorMessages.js        # API error parser & user-facing messages
        └── exportUtils.js          # CSV & JSON analytics export utilities
```

---

## 🎨 Design System & Glassmorphism Aesthetics

DecisionHub utilizes custom **CSS Custom Properties** and **Tailwind CSS** utility classes to deliver a unified glassmorphism aesthetic:

### Theme Modes & Accents
The user can switch between curated themes via the top navigation bar or keyboard shortcuts:
* **Dark (Default)**: Deep midnight slate background with luminous translucent glass cards.
* **Slate**: Minimalist monochrome aesthetic designed for readability.
* **Emerald**: High-contrast nature accents inspired by sustainability.
* **Royal**: Indigo-blue corporate accents tailored for enterprise decision-makers.

### Glassmorphism Tokens
```css
/* Glass Card styling */
background: rgba(15, 23, 42, 0.75);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

---

## 🚀 Application Route Catalog (25 Routes)

| Path | Component | Access | Purpose |
|---|---|---|---|
| `/login` | `LoginPage` | Public | Account authentication & Google OAuth |
| `/signup` | `SignupPage` | Public | User registration |
| `/forgot-password` | `ForgotPasswordPage` | Public | Password recovery request |
| `/reset-password` | `ResetPasswordPage` | Public | Reset password with token from query |
| `/onboarding` | `OnboardingWizard` | Protected | Post-signup profile & interest selector |
| `/dashboard` | `DashboardPage` | Protected | Main community feed & live activity |
| `/analysis` | `AnalysisPage` | Protected | Personal voting analysis & outcome tracking |
| `/analytics` | `AnalyticsPage` | Protected | Creator metrics, impressions & conversions |
| `/decisions/create`| `CreateDecision` | Protected | Decision board & poll creator wizard |
| `/decisions/:id` | `DecisionDetails` | Protected | MCDA matrix, poll ballot, discussions |
| `/decisions/:id/edit`| `EditDecision` | Owner/Admin | Modify decision fields & criteria |
| `/decisions/:id/vote`| `VotePage` | Protected | Focused voting ballot interface |
| `/decisions/:id/report`| `DecisionReportPage`| Protected | Exportable decision analysis report |
| `/communities` | `CommunitiesPage` | Protected | Browse interest-based communities |
| `/communities/create`| `CreateCommunity` | Protected | Create a new community space |
| `/communities/:id` | `CommunityDetails` | Protected | Community hub, members & live chat |
| `/communities/:id/reports`| `CommunityReportsPage`| Moderator | Community moderation dashboard |
| `/admin` | `AdminPage` | `ADMIN` Only | User roles, status & audit log review |
| `/admin/reports` | `AdminReportsPage` | `ADMIN` Only | Platform-wide moderation queue |
| `/admin/statistics`| `AdminStatisticsPage`| `ADMIN` Only | System metrics & time-series analytics |
| `/profile` | `Profile` | Protected | User profile, interest tags & bookmarks |
| `/contact-support` | `ContactSupport` | Public | Customer support ticket submission |
| `/privacy-policy` | `PrivacyPolicy` | Public | Privacy policy disclosure |
| `/terms-conditions`| `TermsConditions` | Public | Terms and conditions |
| `*` | `NotFound` | Public | 404 error fallback view |

---

## ⚡ Real-Time WebSocket Hook (`useCommunityChat`)

The custom hook `useCommunityChat(communityId, channelId)` provides:
* Automatic STOMP connection over SockJS to `/ws` with active JWT token.
* Subscription to channel message broadcasts `/topic/community.{communityId}.channel.{channelId}`.
* Emoji reaction event synchronization.
* Debounced typing indicator emission and listener.
* Unread message badge updates and read receipts.
* Reconnect handling with exponential backoff upon network interruption.

---

## 📊 Data Visualization: Custom SVG Chart Engines

To maintain zero external bundle dependencies and high responsiveness, DecisionHub uses custom React SVG components:
1. **`ResultChart.jsx`**:
   - Renders animated percentage bar distributions.
   - Highlights winning option with golden border badge.
   - Fully reactive to theme color changes.
2. **`PieChart.jsx`**:
   - Computes SVG circular arcs dynamically using trigonometric functions.
   - Interactive hover slice explosion with tooltip readout.

---

## 🛠️ Local Development & Production Build

### Install Dependencies
```bash
cd frontend
npm install
```

### Start Development Server
```bash
npm run dev
```
Starts at `http://localhost:3000` (or `5173`) with API and WebSocket proxies configured to `http://localhost:8080`.

### Build Production Assets
```bash
npm run build
```
Outputs optimized static assets to `dist/`.

### Preview Production Build
```bash
npm run preview
```
