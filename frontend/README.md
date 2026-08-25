# DecisionHub — Frontend Web Application (`/frontend`)

The frontend of **DecisionHub** is a single-page application built with **React 18**, **Vite 5**, **Tailwind CSS**, **Framer Motion**, and a modern Glassmorphism theme system.

---

## 📁 Directory Structure

```
frontend/
├── Dockerfile                  # Multi-stage Node builder + Nginx production container
├── index.html                  # HTML5 entry point & typography link
├── nginx.conf                  # Nginx proxy & SPA client routing config
├── package.json                # NPM packages & build scripts
├── postcss.config.js           # PostCSS Tailwind preprocessor
├── tailwind.config.js          # Custom theme tokens, colors, glass borders & utilities
├── vite.config.js              # Vite server & proxy configuration
└── src/
    ├── main.jsx                # React DOM root renderer
    ├── App.jsx                 # Top-level routing & layout coordinator
    ├── index.css               # Global theme tokens, variables, & utility classes
    ├── api/
    │   └── axiosClient.js      # Central API client (Auth, Decisions, Votes, Admin, Interests, Bookmarks)
    ├── components/             # Reusable UI component library
    │   ├── AdminRoute.jsx      # Role-based route guard for ADMIN users
    │   ├── AuthPageShell.jsx   # Shared layout for auth pages
    │   ├── BrandMark.jsx       # DecisionHub vector logo & branding
    │   ├── CategoryBadge.jsx   # Color-coded category tags
    │   ├── CategorySelector.jsx# Interactive category picker
    │   ├── ComparisonMatrix.jsx# MCDA factor scoring & Pros/Cons breakdown
    │   ├── DecisionCard.jsx    # Feed card with interactive Bookmark/Save button
    │   ├── Footer.jsx          # Pinned sticky footer with navigation links
    │   ├── IconSidebar.jsx     # Right-edge quick utility & theme control rail
    │   ├── InterestTaxonomyEditor.jsx # Interactive topic categories picker
    │   ├── Loader.jsx          # Animated spinner & skeleton loading states
    │   ├── Navbar.jsx          # Role-aware navigation bar with active route highlighting
    │   ├── PageTransition.jsx  # Framer Motion smooth page transitions
    │   ├── PieChart.jsx        # Animated SVG donut chart with interactive hover slices
    │   ├── PollCard.jsx        # Single, Multiple, & 5-Star Rating poll ballot
    │   ├── ProtectedRoute.jsx  # Auth guard component redirecting unauthenticated users
    │   ├── ResultChart.jsx     # Vote distribution bar chart component
    │   └── VoteButton.jsx      # Animated interactive vote button
    ├── context/
    │   └── AuthContext.jsx     # React Context for authentication state & user sessions
    ├── pages/                  # Route view components
    │   ├── AdminPage.jsx       # /admin — Platform administration, users, moderation & logs
    │   ├── AnalysisPage.jsx    # /analysis — Voted decisions, win/loss stats & vote charts
    │   ├── AnalyticsPage.jsx   # /analytics — Creator reach, views, votes & conversion
    │   ├── CommunitiesPage.jsx # /communities — Community hub directory
    │   ├── CommunityDetails.jsx# /communities/:id — Group discussions & decisions
    │   ├── ContactSupport.jsx  # /contact-support — Support tickets & contact channels
    │   ├── CreateCommunity.jsx # /communities/create — Community creation form
    │   ├── CreateDecision.jsx  # /decisions/create — Poll builder with Single/Multiple/Rating types
    │   ├── DashboardPage.jsx   # /dashboard — Main feed & quick-action cards
    │   ├── DecisionDetails.jsx # /decisions/:id — Decision info, comments, attached poll
    │   ├── EditDecision.jsx    # /decisions/:id/edit — Modify decision fields & status
    │   ├── ForgotPasswordPage.jsx # /forgot-password — Password recovery request
    │   ├── OnboardingWizard.jsx# /onboarding — Post-signup profile & interest wizard
    │   ├── Profile.jsx         # /profile — Profile info, typography, interests & saved decisions
    │   ├── ResetPasswordPage.jsx # /reset-password — Confirm password reset with token
    │   ├── SignupPage.jsx      # /signup — User registration
    │   └── VotePage.jsx        # /decisions/:id/vote — Interactive poll ballot (Single/Multi/Rating/Anonymous)
    ├── services/               # API service wrappers
    │   ├── decisionService.js  # Decision CRUD helpers
    │   ├── userService.js      # Profile, interests, & saved decisions helpers
    │   └── voteService.js      # Polling & voting helpers
    └── theme/
        ├── themes.js           # Theme and typography constants
        └── useTheme.js         # Theme switching hook (Light, Dark, Slate, Accent modes)
```

---

## 🚀 Application Routes

| Path | Page Name | Access | Description |
|---|---|---|---|
| `/login` | `LoginPage` | Public | Account authentication |
| `/signup` | `SignupPage` | Public | New user registration (redirects to `/onboarding`) |
| `/forgot-password` | `ForgotPasswordPage` | Public | Password reset request |
| `/reset-password` | `ResetPasswordPage` | Public | Set new password using token parameter |
| `/onboarding` | `OnboardingWizard` | Protected | 3-step profile, avatar, and interest setup |
| `/dashboard` | `DashboardPage` | Protected | Community decision stream & summary |
| `/analysis` | `AnalysisPage` | Protected | User's voted decisions, win/loss indicators & charts |
| `/analytics` | `AnalyticsPage` | Protected | Creator impressions, reach, views, and conversion rates |
| `/decisions/create`| `CreateDecision` | Protected | Decision poll creator (Single, Multiple, Rating) |
| `/decisions/:id` | `DecisionDetails` | Protected | Full decision details, attached poll & discussion |
| `/decisions/:id/edit` | `EditDecision` | Protected | Update decision metadata, status, and category |
| `/decisions/:id/vote` | `VotePage` | Protected | Cast vote ballot (Single/Multiple/Rating/Anonymous) |
| `/admin` | `AdminPage` | Admin Only | User moderation, role management, audit logs & settings |
| `/profile` | `Profile` | Protected | Profile overview, typography, interests & saved decisions |
| `/communities` | `CommunitiesPage` | Protected | Browse and search platform communities |
| `/communities/create` | `CreateCommunity` | Protected | Create a new community space |
| `/communities/:id` | `CommunityDetails` | Protected | Community decisions, members, and details |
| `/privacy-policy` | `PrivacyPolicy` | Protected | Privacy policy & data protection terms |
| `/terms-conditions`| `TermsConditions`| Protected | Platform terms & conditions |
| `/contact-support`| `ContactSupport` | Protected | Customer support & inquiry submission |

---

## 📊 Data Visualization & Chart Architecture

DecisionHub employs custom **SVG and Framer Motion animated visualizations** (`PieChart.jsx` and `ResultChart.jsx`) engineered directly into the React component tree.
- **Benefits**: Zero canvas overhead, full responsiveness, reactive CSS variable theming (Dark / Slate / Emerald / Royal), accessible DOM tooltips, and crisp rendering on high-DPI retina screens without external Chart.js bundle overhead.

---

## 🛠️ Development & Build

### Run Locally
```bash
npm install
npm run dev
```
Dev server starts at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Generates production bundle in `dist/`.
