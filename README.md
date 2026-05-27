# Course Request Management

A working prototype for school counselors and assistant principals to view a student cohort and manage per-student course requests (priority vs elective) for the upcoming school year.

Built as a take-home exercise for Timely.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Note:** Request edits persist across page refresh via an in-memory server store. Restarting the dev server resets data to seed values.

## Features

- **Cohort roster** — 10 students with grade, profile, status chips, and request counts; sorted with “needs attention” first
- **Search & filter** — by name; filter to students needing review
- **Student workspace** — two-column summary (Priority | Elective), contextual banners for edge cases (ELL, retake, AP load, transfer)
- **Add / remove / retag** — assign courses from a 37-course catalog; toggle priority vs elective; optional notes
- **REST API** — `/api/students`, `/api/courses`, `/api/requests/[id]` backed by swappable repository

## Architecture

```
UI (React client components)
  → fetch /api/*
    → CourseRequestRepository (interface)
      → InMemoryStore (singleton, seeded from JSON)
```

| Path | Role |
|------|------|
| `src/data/*.json` | Seed catalog, roster, initial requests (simulates future API payloads) |
| `src/lib/repository/types.ts` | Repository contract |
| `src/lib/repository/in-memory-store.ts` | Mutable in-memory implementation |
| `src/lib/flags.ts` | Derived flags (`ell`, `retake`, `ap_heavy`, etc.) and sort order |
| `src/lib/export.ts` | `buildSchedulingExport()` stub for external scheduler handoff |
| `src/app/api/**` | Thin route handlers delegating to repository |

**Swapping data sources:** Implement `CourseRequestRepository` against a real HTTP client; keep API route signatures or point the UI at an external base URL. UI components do not import seed JSON directly.

## Design & UX decisions

- **Attention-first roster** — Counselors working large cohorts need “who needs me?” before alphabetical browsing. `needsAttention` is derived from flags, empty requests, and TBD notes.
- **Master–detail layout** — Persistent sidebar on desktop reduces navigation cost when moving student to student.
- **Civic / editorial aesthetic** — Warm paper background, Fraunces + IBM Plex Sans, rose/teal semantic colors for priority vs elective. Avoids generic dashboard styling.
- **Soft warnings, not hard blocks** — Grade-level catalog hints and AP-load banners inform judgment without blocking saves (district rules unknown in a prototype).

## Assumptions & open questions

- Single school year (`2026-2027`) and single implicit staff role (no auth).
- Counselors assign priority vs elective; students do not self-serve in this prototype.
- One request row per student per course code (duplicates rejected with 409).
- Catalog grade levels are advisory; counselors may override.
- **Open questions for discovery:** max courses per student? Who marks a list “complete” for scheduling? How does SIS roster sync affect in-flight requests? Hard vs soft co-requisite enforcement?

## Testing

### Philosophy (test pyramid)

| Layer | Location | What it protects |
|-------|----------|------------------|
| **Unit** | `tests/unit/` | Pure business rules (`flags`, `export`) |
| **Integration** | `tests/integration/` | Repository + API route contracts |
| **Component** | `tests/components/` | Counselor-facing UI behavior (RTL) |
| **E2E** | `tests/e2e/` | Full flows in a real browser (Playwright) |

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all Vitest suites (unit, integration, components) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage thresholds on `src/lib` + `src/app/api` |
| `npm run test:components` | Component tests only |
| `npm run test:e2e` | Playwright (starts `next start`; run `npm run build` first in CI) |
| `npm run test:ci` | Full local CI gate: lint → build → coverage → e2e |

**First-time setup for e2e:** `npx playwright install --with-deps chromium`

### Adding a new test

1. **Business rule** (sorting, flags, validation) → `tests/unit/`
2. **API or repository behavior** → `tests/integration/`; call `resetStore()` is automatic via `tests/setup.ts`
3. **UI interaction** → `tests/components/` with Testing Library
4. **Cross-screen counselor flow** → `tests/e2e/`

Use factories in `tests/fixtures/` for small payloads; seed JSON remains the source of truth for full catalog tests.

### Store isolation

- `createStore()` — fresh in-memory instance (repository integration tests)
- `resetStore()` — re-seed singleton before each test (API route tests; global `beforeEach` in `tests/setup.ts`)

### Coverage

Coverage is enforced for `src/lib/**` and `src/app/api/**` (70%+ lines/branches). Reports are written to `coverage/` after `npm run test:coverage`.

Component coverage is exercised selectively via RTL and e2e; not gated in CI thresholds yet.

### CI (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — runs on push to `main` and all pull requests.

| Job | Command |
|-----|---------|
| `lint` | `npm run lint` |
| `build` | `npm run build` |
| `test` | `npm run test:coverage` (uploads `coverage/` artifact) |
| `e2e` | `npm run build` + Playwright chromium + `npm run test:e2e` |

Failed e2e runs upload a `playwright-report` artifact for debugging.

**Recommended branch protection on `main`:** require `lint`, `build`, `test`, and `e2e` checks.

**Node version:** `.nvmrc` pins Node 22 (also set in `package.json` `engines`).

### Not tested (yet)

- Full `AppShell` / `StudentWorkspace` fetch wiring (covered by e2e)
- Auth, multi-tenant, SIS integration
- Visual regression / load testing

## Pilot → scale

For a pilot with a few schools, the current stack (Next.js + in-memory or single-tenant DB + simple API) is appropriate. To scale: persist requests in PostgreSQL with `updated_at` / versioning, add staff auth (SSO), roster import from SIS, audit log for counselor changes, and async export jobs to the scheduling engine. Keep the repository boundary so the UI remains stable while backend services split.

---

## Written extensions

### Co-requisite courses

Model co-requisites as a first-class relation, not implicit knowledge in the catalog:

```ts
interface CoRequisiteGroup {
  id: string;
  courseCodes: string[];
  rule: "all_required"; // extend later: "choose_one_of", etc.
}
```

Validation runs on save: if any code in a group appears on a student’s request list, all codes in that group must be present (or the counselor records an approved exception). In the UI, adding one half of a pair triggers an inline warning with actions **Add missing course** and **Dismiss** (with reason captured for audit). For a pilot, warnings are non-blocking; districts that require hard enforcement can toggle policy. UX considerations: explain *why* the pair matters (graduation vs catalog rule), show the group name, and avoid modal fatigue—prefer inline banners in the request workspace over blocking dialogs.

**Assumptions to validate:** Are co-reqs always symmetric? Can one course belong to multiple groups? Are substitutes allowed?

### Integration with an external scheduling platform

Treat the scheduling system as a downstream consumer of **versioned snapshots**, not a live mirror of mutable state. The canonical model remains `CourseRequest` rows with `updated_at`. An export job builds a payload (student ID, school year, course codes, request types) and delivers via signed HTTPS webhook or secure file drop (e.g. S3 + short-lived URL). Security: staff-only auth, least-privilege API keys, TLS, minimize PII to what scheduling requires. When requests change after export, increment a monotonic `version` and either send a full idempotent replace or a changelog with `export_id`. The UI shows **Last sent to scheduler: [date]** and **Requests changed since last export** so counselors know to re-sync. Idempotency keys on the receiver prevent duplicate enrollments from retries.

**Assumptions to validate:** Batch nightly vs real-time? Does the scheduler accept deletes? Who owns conflict resolution?

### Changing student population

Students need `enrollmentStatus` (`active`, `incoming`, `withdrawn`) and `enrolledAt`. Only `active` / `incoming` students appear in the default roster; withdrawn students are hidden but retained for history. New enrollments surface in an **attention queue** (no requests, or `incoming` without completed credit review). Mid-year transfers like S010 stay flagged until transcript evaluation completes. The roster sort prioritizes: no requests → credit pending → recently enrolled. Optional feed from SIS webhooks updates roster without wiping in-progress counselor work (merge by student ID). Product UX: dashboard counts (“4 new students without requests”), email digest for counselors, and clear draft vs finalized states so partial work is not exported prematurely.

**Assumptions to validate:** Is SIS the roster source of truth? Do withdrawn students’ requests get archived or deleted?
