# Flow — Personal Finance Tracker

A full-stack personal finance app that lets you upload bank statements, auto-categorizes transactions using a three-tier system (user rules, system rules, Claude AI), and displays spending insights with budget tracking.

**Live:** [flow-personal-finance-app.vercel.app](https://flow-personal-finance-app.vercel.app)

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

Open [http://localhost:3002](http://localhost:3002) in your browser.

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
npm run dev       # Start dev server (port 3002)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
