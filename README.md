# Personal Finance Tracker

A personal finance app that lets you upload bank statements from multiple institutions, auto-categorizes transactions using a three-tier priority system (user rules, system rules, AI fallback), and displays insights on a premium dashboard.

## Features

- **File Upload** — Import CSV/XLSX statements from multiple banks (Chase, Amex, etc.)
- **Normalization** — Auto-detect bank formats and parse into a unified transaction schema
- **Auto-Categorization** — Three-tier priority: user rules → system rules → Claude AI fallback
- **Recategorization** — Change a transaction's category inline; optionally save as a persistent rule
- **Dashboard** — Total balance, monthly spending, spending allocation donut chart, recent activity
- **Insights** — Monthly/yearly spending trends, AI-generated insight cards, budget progress with over-limit warnings
- **Category Management** — Hierarchical parent/child categories, search, exclude-from-totals toggle
- **Responsive** — Desktop sidebar nav + mobile bottom tab bar

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) with TypeScript |
| Styling | Tailwind CSS v4 with custom design tokens |
| Font | Plus Jakarta Sans + Material Symbols Outlined |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI Fallback | Anthropic Claude API |
| File Parsing | Papa Parse (CSV), SheetJS (XLSX) |
| Charts | Recharts + custom SVG donut |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Supabase project (optional — app runs with sample data without it)
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
ANTHROPIC_API_KEY=sk-ant-...
```

All variables are optional for local development — the app falls back to static sample data.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Dashboard (home)
│   ├── transactions/page.tsx     # Transaction history with search/filter
│   ├── import/page.tsx           # File upload screen
│   ├── insights/page.tsx         # Spending trends, budgets, AI insights
│   ├── categories/page.tsx       # Category management (hierarchy)
│   └── api/
│       ├── upload/route.ts       # File upload + parse + categorize pipeline
│       ├── categorize/route.ts   # Recategorize a transaction
│       └── dashboard/route.ts    # Dashboard aggregation stats
├── components/
│   ├── layout/                   # BottomNav, Header, PageShell
│   ├── dashboard/                # DashboardPage (balance, donut, activity)
│   ├── transactions/             # TransactionList, TransactionRow, CategoryPill
│   ├── import/                   # DropZone, AccountSelector, UploadHistory
│   ├── categories/               # CategoryTree, CategoryRow, SubCategoryRow
│   └── ui/                       # Badge, Button, Card, Modal, ProgressBar
├── lib/
│   ├── supabase/                 # Client, server, and admin Supabase clients
│   ├── parsers/                  # CSV/XLSX parsers + bank format normalizer
│   ├── categorization/           # Engine, user rules, system rules, AI fallback
│   ├── types.ts                  # Shared TypeScript types
│   └── utils.ts                  # Currency/date formatters, helpers
└── hooks/                        # (planned) React hooks for data fetching
```

## Categorization Engine

Transactions are categorized in strict priority order:

1. **User Rules** (highest priority) — Custom rules created when a user recategorizes a transaction and checks "Always categorize this merchant here"
2. **System Rules** — Pre-seeded rules matching common merchants (e.g., STARBUCKS → Coffee Shops, NETFLIX → Subscriptions)
3. **AI Fallback** — Claude API classifies unmatched transactions with a confidence score; transactions below 0.6 confidence remain uncategorized for manual review

## Database

Supabase PostgreSQL with Row Level Security. Run migrations in order:

```bash
# Apply schema
supabase db push supabase/migrations/001_initial_schema.sql
supabase db push supabase/migrations/002_seed_data.sql
```

Tables: `profiles`, `accounts`, `categories`, `uploads`, `transactions`, `categorization_rules`, `system_rules`, `budgets`

## Scripts

```bash
npm run dev       # Start dev server (port 3002)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
