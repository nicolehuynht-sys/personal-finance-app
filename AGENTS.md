<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Workspace Assistant Guide

This file is the primary workspace bootstrap instruction for AI assistant workflows in this repository.

### What this app is

- Full-stack **personal finance tracker** built with **Next.js 16 App Router**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.
- Supports bank statement **CSV/XLSX upload**, **auto-categorization**, **budget tracking**, and **spending insights**.
- Uses an optional **Anthropic Claude Haiku** AI fallback for categorization when rules do not match.

### Key commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

### Important environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (optional)

### Primary project structure

- `src/app/` — page routes, auth pages, and server API route handlers
- `src/components/` — UI components, layout, dashboard, import flow, transactions, categories
- `src/lib/` — business logic, Supabase clients, parsers, categorization engine, shared types, utilities
- `src/hooks/` — reusable hooks like auth state management
- `supabase/migrations/` — database schema and seed data
- `public/` — static assets

### What to look at first

- `src/lib/supabase/` — Supabase browser/client and server/admin helpers
- `src/lib/parsers/` — CSV/XLSX parsing and bank format normalization
- `src/lib/categorization/` — user rules, system rules, AI fallback, and classification priority
- `src/app/api/upload/route.ts` — upload processing, parsing, and transaction insertion
- `src/middleware.ts` — auth guard for protected app routes
- `src/components/layout/` — common layout and navigation patterns

### Assistant conventions

- Preserve the existing architecture and naming conventions.
- Use `@/` path aliases for imports when available.
- Avoid adding new dependencies unless necessary.
- Prefer incremental, focused changes instead of large rewrites.
- Validate changes by running the app and `npm run lint` when possible.
- Do not add tests unless explicitly requested; this repo currently has no test suite.

### Notes for Supabase and AI

- The app is backed by Supabase with Row Level Security enabled.
- Database migrations are stored in `supabase/migrations/`.
- AI categorization is optional and only used when `ANTHROPIC_API_KEY` is set.
- Categorization priority is: **user rules → system rules → AI fallback**.

---

# Flow — Personal Finance Tracker

A full-stack personal finance app that lets you upload bank statements, auto-categorizes transactions using a three-tier system (user rules, system rules, Claude AI), and displays spending insights with budget tracking.

## Features

- **Authentication** — Email/password signup + Google OAuth, forgot/reset password flow
- **File Upload** — Import CSV/XLSX bank statements with drag-and-drop, link to accounts, duplicate detection, delete uploads
- **Bank Format Support** — Auto-detects Scotiabank chequing, Scotiabank VISA, Chase, Amex, and headerless CSV formats
- **Auto-Categorization** — Three-tier priority: user rules → system rules → Claude AI fallback (Haiku, rate-limited)
- **Recategorization** — Change a transaction's category inline via dropdown; optionally save as a persistent rule
- **Dashboard** — Total balance, monthly spending, spending allocation donut chart, recent activity
- **Transaction History** — Search, filter by date (This Month) or category dropdown, daily groupings with subtotals
- **Insights** — Monthly/yearly spending bar chart, date filter, budget progress with over-limit warnings, AI insight cards
- **Category Management** — Hierarchical parent/child tree, search, add/edit/delete, exclude-from-totals toggle per category
- **Budget Tracking** — Set monthly limits per category, auto-aggregates child category spending into parent budgets
- **Responsive** — Desktop sidebar nav + mobile bottom tab bar, no-scroll dashboard on desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) with TypeScript |
| Styling | Tailwind CSS v4 with custom design tokens |
| Font | Plus Jakarta Sans + Material Symbols Outlined |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| AI Categorization | Anthropic Claude Haiku API (rate-limited, optional) |
| File Parsing | Papa Parse (CSV), SheetJS (XLSX) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project
- Anthropic API key (optional — only needed for AI categorization)

### Install & Run

```bash
npm install
npm run dev
```

Open the local server on the port printed by `npm run dev`.

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...   # Optional — AI categorization skipped if not set
```

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql` — Creates tables, RLS policies, indexes
   - `supabase/migrations/002_seed_data.sql` — Seeds default categories, sub-categories, and system rules
3. Configure Auth:
   - **Authentication → Providers** — Disable "Confirm email" for instant signup
   - **Authentication → URL Configuration** — Set Site URL and add redirect URLs for `/auth/callback` and `/auth/reset-password`
   - **Authentication → Providers → Google** (optional) — Add Google OAuth Client ID and Secret

### Deploy to Vercel

1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Dashboard (home)
│   ├── transactions/page.tsx         # Transaction history with search/filter
│   ├── import/page.tsx               # File upload with account linking
│   ├── insights/page.tsx             # Spending trends, budgets, AI insights
│   ├── categories/page.tsx           # Category management (hierarchy + exclude toggle)
│   ├── auth/
│   │   ├── login/page.tsx            # Email/password + Google OAuth login
│   │   ├── signup/page.tsx           # Account creation with required name
│   │   ├── forgot-password/page.tsx  # Password reset email request
│   │   ├── reset-password/page.tsx   # New password form
│   │   └── callback/route.ts        # OAuth callback + new user seeding
│   └── api/
│       ├── upload/route.ts           # File upload → parse → categorize → insert
│       ├── categorize/route.ts       # Recategorize a transaction
│       └── dashboard/route.ts        # Dashboard aggregation stats
├── components/
│   ├── layout/                       # BottomNav (with logout), Header, PageShell
│   ├── dashboard/                    # DashboardPage (balance, donut, activity)
│   ├── transactions/                 # TransactionList, TransactionRow, CategoryPill
│   ├── import/                       # DropZone, AccountSelector, UploadHistory
│   ├── categories/                   # CategoryTree, CategoryRow, SubCategoryRow
│   └── ui/                           # Badge, Button, Card, Modal, ProgressBar
├── lib/
│   ├── supabase/                     # Client, server, and admin Supabase clients
│   ├── parsers/                      # CSV/XLSX parsers + bank format normalizer
│   ├── categorization/               # Engine, user rules, system rules, AI fallback
│   ├── auth.ts                       # Default categories for new user seeding
│   ├── types.ts                      # Shared TypeScript types
│   └── utils.ts                      # Currency/date formatters, helpers
├── hooks/
│   └── useAuth.ts                    # Auth state hook (user, userId, loading)
└── middleware.ts                      # Auth guard — redirects unauthenticated users to login
```

## Categorization Engine

Transactions are categorized in strict priority order:

1. **User Rules** (highest) — Custom rules created when a user recategorizes and checks "Always categorize this merchant here"
2. **System Rules** — Pre-seeded rules matching common merchants (e.g., STARBUCKS → Coffee & Dessert, UBER → Ride Share)
3. **AI Fallback** — Claude Haiku classifies unmatched transactions; confidence < 0.6 stays uncategorized for manual review

### AI Safeguards

- Uses Claude **Haiku** (10x cheaper than Sonnet)
- **10 batch API calls per user per day** (200 transactions max)
- Gracefully skips if no `ANTHROPIC_API_KEY` is set
- Batches up to 20 transactions per API call

## Database Schema

Supabase PostgreSQL with Row Level Security enabled on all tables:

| Table | Purpose |
|---|---|
| `profiles` | User display name and avatar |
| `accounts` | Bank accounts (checking, savings, credit, etc.) |
| `categories` | Hierarchical categories with exclude-from-totals flag |
| `uploads` | File upload records with status tracking |
| `transactions` | Unified transactions with categorization metadata |
| `categorization_rules` | User-created rules for auto-categorization |
| `system_rules` | Global merchant matching rules |
| `budgets` | Monthly spending limits per category |

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
