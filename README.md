ReelScheduler Project Specification & Flow

1. Product Overview
- Purpose: Automates short-form video distribution by centralizing media management, bundling related assets, and scheduling automated publishing to social platforms.
- Platforms: Responsive React (Vite) frontend served by a Node.js/Express backend, backed by MongoDB via Mongoose.
- Monetization: Subscription tiers (Free, Creator, Professional) with feature gating, Stripe/UPI billing, and plan upgrade flows.

2. Tech Stack & Integrations
- Frontend: React, Vite, Tailwind CSS; protected routing, contexts for auth and integrations.
- Backend: Node.js, Express, Mongoose, Agenda/cron utilities, Nodemailer, Winston logging.
- Database: MongoDB (users, videos, bundles, schedules, plans, team members, features, logs).
- Third-Party Services: Stripe (payments), YouTube Data API (publish/analytics), Appwrite Storage (media), optional Facebook auth scaffolding.
- Deployment/Ops: Render deployment, PM2 ecosystem config, production optimization scripts, memory monitoring.

3. Key Features
- Authentication & Accounts: JWT login, password recovery, OAuth helpers, profile management, route guarding.
- Subscription & Billing: Plan catalog, Stripe checkout, UPI flows, middleware enforcement of plan limits, subscription dashboards.
- Video Lifecycle: Upload, storage, metadata, YouTube connection/reconnect, analytics imports.
- Content Bundles: Bundle CRUD, video association, quota enforcement, limit notifications.
- Scheduling Engine: Schedule creation/editing, frequency rules (daily/weekly/monthly), timezone handling, cron automation, plan-based limits.
- Analytics & Reporting: Usage metrics, YouTube performance, admin dashboards, CSV exports.
- Team Collaboration: Invitations, permission matrix (upload/admin/edit), combined owner/team workflows.
- Admin Console: Manage users, plans, transactions, logs, moderation tools, feature toggles.
- Notifications & Email: Transactional and support messages through Nodemailer, feedback/contact flows.
- Platform Infrastructure: Configuration management, logging, error handling, deployment scripts, monitoring.

4. Project Flow (High-Level)
- User Journey:
  1. Register/Login → JWT-protected session (AuthController & AuthContext).
  2. Connect YouTube (tokens stored, refresh helpers) and optionally Facebook.
  3. Upload videos → stored via Appwrite/local storage, metadata tracked in MongoDB.
  4. Organize videos into bundles → enforce plan-specific bundle limits.
  5. Create schedules → choose bundle, frequency, timezone; validate plan limits/permissions.
  6. Scheduler service runs cron jobs → publishes via YouTube integration, updates status/logs.
  7. Monitor analytics → user dashboards for performance, admin analytics for system insight.
  8. Manage team members → invite, change permissions, share content.
  9. Reach plan limits → subscription CTAs, upgrade flows (Stripe/UPI).
- Backend Flow:
  - Express routes → middleware authentication → subscription checks → controller logic → models/services → respond to frontend.
  - Scheduler/Agenda jobs process queued publishes and reminders.
  - Logging and error handler capture operational telemetry.
- Frontend Flow:
  - React router with protected routes → AuthContext ensures session.
  - Pages call service layer (axios API wrapper) → displays state via components.
  - Modals/toasts for limit warnings, success/failure states.

5. Current Issues & Known Challenges
- Previous Bug: “Bundle Limit Reached” shown for schedule limits; resolved by separating feature checks and improving backend responses, but requires regression testing.
- Subscription Data Consistency: Historical users may lack complete subscription objects, causing false “Active Schedule Limit Reached” errors; fix endpoints added, but automated migration still recommended.
- Plan Limit Accuracy: Need end-to-end tests to ensure `checkSubscription` middleware returns correct feature-specific data for all plan combinations.
- Scheduler Reliability: Cron jobs depend on external services (YouTube); need monitoring/retry strategy for API failures and rate limits.
- YouTube OAuth Tokens: Tokens must be refreshed safely; ensure secure storage and timely refresh to avoid publish failures.
- Bulk Upload/Processing: Large video uploads may strain storage bandwidth; consider queueing, chunk uploads, or CDN.
- Facebook Integration: Currently placeholder/partial; need clear roadmap or feature flag to avoid user confusion.
- Analytics Depth: Premium plans may need more granular metrics; analytics service should scale to higher data volumes.
- Team Permissions: Permission matrix is expanding; ensure backend and frontend validations are synchronized.
- Operational Visibility: Continue investing in logging, memory monitoring, and alerting to maintain <1% schedule failure rate.

6. Next Steps / To-Do
- Automate subscription data normalization for legacy users.
- Expand test coverage for plan limits, scheduler edge cases, and error flows.
- Define product roadmap for additional social platforms and mobile UX improvements.
- Formalize compliance requirements (GDPR, SOC2) for enterprise tiers.
- Enhance analytics dashboards for professional plans with more granular reporting.

ReelScheduler/
├── frontend/                # React + TypeScript frontend
│   ├── public/              # Static assets
│   ├── src/                 # Frontend source code
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── test-videos/         # Local test videos
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
│
├── docker/                  # Docker configuration
│   ├── docker-compose.yml   # Docker Compose config
│   └── mongo-init.js        # MongoDB initialization script
│
└── README.md                # Project documentation
