# World Cup Sweepstake Pro - Development Checklist

## Database & Schema
- [x] Create pools table (id, name, slug, organizer_id, entry_fee, currency, max_participants, plan, status, created_at)
- [x] Create participants table (id, pool_id, user_id, name, assigned_team, payment_status, created_at)
- [x] Create teams table (id, name, group, flag_emoji, points, stage)
- [x] Create payments table (id, pool_id, user_id, amount, paystack_reference, status, created_at)
- [x] Seed World Cup 2026 teams (32 teams with flags and groups)
- [x] Create database migrations and apply via webdev_execute_sql

## Core Types & Utilities
- [x] Define TypeScript types for Pool, Participant, Team, Payment
- [x] Create slug generator utility
- [x] Create team draw/assignment logic
- [x] Create points calculation utility based on tournament stage
- [x] Create Paystack integration helpers

## Backend API Routes (tRPC Procedures)
- [x] Pool management: create, list, get, update, delete
- [x] Participant management: add, list, update payment status
- [x] Draw execution: random team assignment algorithm
- [x] Leaderboard: fetch ranked participants by points
- [ ] PDF export: generate PDF with draw results and leaderboard
- [ ] Payment verification: Paystack webhook handler
- [x] User dashboard: list all pools for authenticated user
- [x] Pool ID returned from create mutation for frontend flow

## Frontend Pages & Components
- [x] Landing page (hero, features, pricing, CTA)
- [x] Pricing section with Free vs Pro tiers
- [x] Dashboard page (list user's pools)
- [x] Create pool form (multi-step: pool details → participants → draw)
- [x] Pool detail page (draw results, leaderboard, share options)
- [x] Upgrade page with Pro pricing
- [ ] Participant management page
- [ ] PDF export button and flow
- [x] WhatsApp share button with pre-filled message
- [x] Payment/upgrade flow with Paystack (env var integration ready)

## UI Components
- [x] Navbar with auth state and navigation
- [x] Footer with links
- [x] Pool card component
- [x] Leaderboard table component
- [x] Draw results card with team assignments (shows actual team data)
- [x] Share panel (WhatsApp + copy link)
- [x] Pricing card component
- [x] Loading states and skeletons

## Design & Styling
- [x] Define color palette and typography (dark theme with amber accents)
- [x] Set up Tailwind theme with premium aesthetic (slate + amber + green)
- [x] Implement responsive design (mobile, tablet, desktop)
- [x] Add smooth animations and transitions
- [ ] Ensure accessibility (WCAG compliance)

## Authentication & Authorization
- [x] Manus OAuth login flow (built-in via template)
- [x] Protected routes (dashboard, pool management)
- [x] User context and session management (via useAuth hook)
- [x] Logout functionality (via auth.logout mutation)

## Payment Integration
- [ ] Paystack API key setup (requires VITE_PAYSTACK_PRO_LINK env var)
- [x] Payment link generation for Pro upgrade (UI ready, env var driven)
- [ ] Webhook verification for payment success
- [ ] Update pool plan after successful payment
- [x] Payment status tracking in database (schema ready)

## Testing & QA
- [ ] Write vitest tests for core utilities
- [ ] Test draw algorithm for randomness and no duplicates
- [ ] Test payment flow end-to-end
- [ ] Test responsive design across devices
- [ ] Test PDF export functionality
- [ ] Test WhatsApp share message generation

## Deployment & Final Steps
- [ ] Environment variables setup (.env.local, .env.example)
- [ ] Final code review and optimization
- [ ] Performance testing
- [ ] Create checkpoint before publishing
- [ ] Documentation and deployment guide
