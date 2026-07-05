# Mediverse Monorepo Project Map

This document maps out the current architecture, directories, entry points, and dependencies of the **Mediverse** medical career operating system workspace.

---

## 🏗️ Workspace Architecture (Turborepo)

The workspace is configured as a `pnpm` monorepo coordinated by Turborepo (`turbo.json`). It is divided into user-facing applications (`apps/`) and shared modules (`packages/`).

```
mediverse/
├── apps/               # Running applications (Next.js, Node.js workers)
│   ├── admin/          # Admin Portal Dashboard (Next.js)
│   ├── web/            # Main Student Portal (Next.js)
│   └── worker/         # Background Queue Worker (BullMQ + Redis)
├── packages/           # Shared workspace packages
│   ├── ai/             # AI query wrappers (Claude + Gemini fallback)
│   ├── config/         # Shared Tailwind, TypeScript, ESLint setups
│   ├── db/             # Drizzle ORM schemas, seeds, & migrations
│   ├── ingestion/      # Medical data ingest connectors (PubMed, YouTube)
│   ├── mcq-pipeline/   # Pharmacology MCQ generation pipeline scripts
│   └── ui/             # Shared component library (React)
└── [configs]           # Workspace configurations (pnpm-workspace.yaml, vercel.json)
```

---

## 📦 Directory Breakdown & Summaries

### 1. `apps/`

#### 💻 `apps/web` (Student Portal)
* **Description:** The core student portal featuring onboarding wizards, personalized dashboards, adaptive MCQ practice engine, AI clinical mentor chat, and programmatic topic views.
* **Entry Points:** 
  * `src/app/page.tsx` (Landing Page)
  * `src/app/login/page.tsx` (Sign up / Consent gate)
  * `src/app/onboarding/page.tsx` (MBBS stage onboarding)
  * `src/app/dashboard/page.tsx` (Personalized dashboard & recommendations)
  * `src/app/mentor/page.tsx` (AI Mentor Chat interface)
* **Key Dependencies:** `next`, `react`, `react-dom`, `@mediverse/db`, `@mediverse/ai`, `jose` (JWT), `tailwind-merge`.

#### 🛡️ `apps/admin` (Admin Dashboard)
* **Description:** Administrative portal console for medical reviewers to audit content items, flag moderation reports, and verify ingested draft items.
* **Entry Points:** `src/app/page.tsx` (Admin dashboard overview)
* **Key Dependencies:** `next`, `react`, `react-dom`, `@mediverse/db`, `@mediverse/ui`.

#### ⚙️ `apps/worker` (Background Process)
* **Description:** Persistent queue processor handling background tasks such as content ingestion, AI profile building, daily email digest dispatches (Resend/FCM), and database cleanups.
* **Entry Points:** 
  * `src/index.ts` (BullMQ listener process)
  * `src/verify-jobs.ts` (Direct job runner script)
* **Key Dependencies:** `bullmq`, `ioredis`, `tsx` (execution), `@mediverse/db`, `@mediverse/ingestion`, `@mediverse/ai`.

---

### 2. `packages/`

#### 🧠 `packages/ai` (AI Engine)
* **Description:** Unified AI module orchestrating intent routing, safety redirects, disclaimers, study plan outlines, and literature citation indexing. Uses Claude Sonnet/Haiku, with a zero-dependency REST fallback to **Google Gemini 1.5 Flash** (via `GEMINI_API_KEY`).
* **Entry Points:** `src/index.ts`
* **Key Dependencies:** `@anthropic-ai/sdk`, `@mediverse/config`.

#### 🗄️ `packages/db` (Database Context)
* **Description:** Schema definitions, connection instantiations, partition tables, trigger functions, and test data seeding scripts.
* **Entry Points:** `src/schema/index.ts`
* **Key Dependencies:** `drizzle-orm`, `postgres` (driver), `sqlite3` (importer).

#### 🔌 `packages/ingestion` (Ingest Connectors)
* **Description:** Ingest connectors interfacing with PubMed E-utilities, Europe PMC open access APIs, Crossref DOIs, and YouTube channels.
* **Entry Points:** `src/index.ts`
* **Key Dependencies:** `@mediverse/config`.

#### ⚡ `packages/mcq-pipeline` (MCQ Pipeline Runner)
* **Description:** Pipeline scripts to extract pharmacology medical facts and generate structured revision MCQs.
* **Entry Points:** `src/index.ts`
* **Key Dependencies:** `@mediverse/db`, `@mediverse/config`.

#### 🎨 `packages/ui` (Component Library)
* **Description:** Shared presentation primitives like cards, buttons, and layouts.
* **Entry Points:** `src/index.ts`
* **Key Dependencies:** `react`.

---

## 🔍 Workspace Audit & Misplaced Files

During the workspace audit, the following misplaced, duplicate, or orphaned files were identified:

1. **`apps/mock-db.json` & `packages/mock-db.json` [MISPLACED / DUPLICATED]:**
   * These JSON database mocks are duplicate outputs left over from standalone tests.
   * *Recommendation:* Consolidate them or delete them if the remote Postgres tables are the sole source of truth.
2. **`mediverse_content_engine_phase1_package.zip` & `mediverse_ingestion_starter_package.zip` [ARCHIVE]:**
   * Zip packages left in the root workspace directory.
   * *Recommendation:* Safely move these to an `archives/` folder or delete them as their contents have already been unzipped and imported into the active monorepo packages.
3. **`mediverse_ingest.sqlite` & `phase1_pharmacology.sqlite` [ORPHANED DATABASES]:**
   * Local SQLite database instances. Since all Pharmacology research content and MCQ templates have been successfully migrated to the remote Supabase PostgreSQL instance, these files are no longer required for active development.
   * *Recommendation:* Move to an `archives/` folder or git-ignore.
