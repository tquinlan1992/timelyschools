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
- **Student workspace** — two-column summary (Priority | Elective), contextual banners for edge cases (English language learner support, retake, Advanced Placement load, transfer)
- **Add / remove / retag** — assign courses from a 37-course catalog; toggle priority vs elective; optional notes
- **Web routes** — `/api/students`, `/api/courses`, `/api/requests/[id]` backed by swappable repository

## Architecture

```
User interface (React client components)
  → fetch /api/*
    → CourseRequestRepository (interface)
      → in-memory store factory (singleton, seeded from JSON)
```

| Path | Role |
|------|------|
| `src/data/*.json` | Seed catalog, roster, initial requests (simulates future server payloads) |
| `src/lib/repository/types.ts` | Repository contract |
| `src/lib/repository/in-memory-store.ts` | Mutable in-memory implementation |
| `src/lib/flags.ts` | Derived flags (`ell`, `retake`, `ap_heavy`, etc.) and sort order |
| `src/lib/export.ts` | `buildSchedulingExport()` stub for external scheduler handoff |
| `src/app/api/**` | Thin route handlers delegating to repository |

**Swapping data sources:** Implement `CourseRequestRepository` against a real web client; keep route signatures or point the user interface at an external base URL. User interface components do not import seed data files directly.

## Design & user experience decisions

- **Attention-first roster** — Counselors working large cohorts need “who needs me?” before alphabetical browsing. `needsAttention` is derived from flags, empty requests, and notes marked to be determined.
- **Master–detail layout** — Persistent sidebar on desktop reduces navigation cost when moving student to student.
- **Civic / editorial aesthetic** — Warm paper background, Fraunces + IBM Plex Sans, rose/teal semantic colors for priority vs elective. Avoids generic dashboard styling.
- **Soft warnings, not hard blocks** — Grade-level catalog hints and Advanced Placement load banners inform judgment without blocking saves (district rules unknown in a prototype).

## Assumptions & open questions

- Single school year (`2026-2027`) and single implicit staff role (no authentication).
- Counselors assign priority vs elective; students do not self-serve in this prototype.
- One request row per student per course code (duplicates rejected with a conflict response).
- Catalog grade levels are advisory; counselors may override.
- **Open questions for discovery:** max courses per student? Who marks a list “complete” for scheduling? How does student information system roster sync affect in-flight requests? Hard vs soft co-requisite enforcement?

## Testing

### Philosophy (test pyramid)

| Layer | Location | What it protects |
|-------|----------|------------------|
| **Unit** | `tests/unit/` | Pure business rules (`flags`, `export`) |
| **Integration** | `tests/integration/` | Repository + route contracts |
| **Component** | `tests/components/` | Counselor-facing user interface behavior (React Testing Library) |
| **End-to-end** | `tests/e2e/` | Full flows in a real browser (Playwright) |

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all Vitest suites (unit, integration, components) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage thresholds on `src/lib` + `src/app/api` |
| `npm run test:components` | Component tests only |
| `npm run test:e2e` | Playwright (starts `next start`; run `npm run build` first in continuous integration) |
| `npm run test:ci` | Full local continuous integration gate: lint → build → coverage → end-to-end |

**First-time setup for end-to-end tests:** `npx playwright install --with-deps chromium`

### Adding a new test

1. **Business rule** (sorting, flags, validation) → `tests/unit/`
2. **Route or repository behavior** → `tests/integration/`; call `resetStore()` is automatic via `tests/setup.ts`
3. **User interface interaction** → `tests/components/` with Testing Library
4. **Cross-screen counselor flow** → `tests/e2e/`

Use factories in `tests/fixtures/` for small payloads; seed data remains the source of truth for full catalog tests.

### Store isolation

- `createStore()` — fresh in-memory instance (repository integration tests)
- `resetStore()` — re-seed singleton before each test (route tests; global `beforeEach` in `tests/setup.ts`)

### Coverage

Coverage is enforced for `src/lib/**` and `src/app/api/**` (70%+ lines/branches). Reports are written to `coverage/` after `npm run test:coverage`.

Component coverage is exercised selectively via React Testing Library and end-to-end tests; not gated in continuous integration thresholds yet.

### Continuous integration (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — runs on push to `main` and all pull requests.

| Job | Command |
|-----|---------|
| `lint` | `npm run lint` |
| `build` | `npm run build` |
| `test` | `npm run test:coverage` (uploads `coverage/` artifact) |
| `e2e` | `npm run build` + Playwright chromium + `npm run test:e2e` |

Failed end-to-end runs upload a `playwright-report` artifact for debugging.

**Recommended branch protection on `main`:** require `lint`, `build`, `test`, and `e2e` checks.

**Node version:** `.nvmrc` pins Node 22 (also set in `package.json` `engines`).

### Not tested (yet)

- Full `AppShell` / `StudentWorkspace` fetch wiring (covered by end-to-end tests)
- Authentication, multi-tenant, student information system integration
- Visual regression / load testing

## Pilot → scale

For a pilot with a few schools, the current stack (Next.js + in-memory or single-tenant database + simple routes) is appropriate. To scale: persist requests in PostgreSQL with `updated_at` / versioning, add staff authentication (single sign-on), roster import from the student information system, audit log for counselor changes, and async export jobs to the scheduling engine. Keep the repository boundary so the user interface remains stable while backend services split.

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Working prototype (localhost) | `npm install && npm run dev` → http://localhost:3000 |
| Source code | This repository (GitHub or ZIP) |

---

## Written extensions

The following sections address scenarios beyond the prototype scope. Each includes assumptions I would validate with district staff and scheduling experts before building production behavior.

### Co-requisite courses

Co-requisites should be modeled as a **first-class catalog relationship**, not buried in course descriptions. I would add a `CoRequisiteGroup` entity with a stable `id`, a list of `courseCodes`, and a `rule` (starting with `all_required`, later extensible to `choose_one_of` or `minimum_n_of`). Courses could reference zero or more groups via a join table. At request time, validation would run whenever a counselor adds or removes a course: if any member of a group is on a student’s list, every other member in that group must also be present, unless the counselor records an explicit override with a reason (stored for audit). In the user interface, I would surface this in the student workspace—not as a blocking error on first save for a pilot, but as a persistent inline banner naming the group (e.g. “Lab science pair”) with one-click actions: **Add missing course** (opens the catalog with the co-requisite pre-selected) and **Record exception**. When adding a course from the catalog, co-requisite partners would show a subtle linked badge so counselors understand dependencies before committing. I would avoid modal stacks; counselors are interrupted often and need scannable, actionable warnings at the point of editing.

**User experience considerations:** Explain *why* the rule exists (graduation requirement vs. district policy vs. scheduling constraint), support partial completion states (one of two added), and ensure warnings still make sense in the attention-first roster (e.g. a “Co-requisite incomplete” chip). For districts that require hard enforcement, policy would flip from warn-only to block-on-save.

**Assumptions & questions to validate:** Are co-requisites always symmetric? Can one course belong to multiple groups? Are substitute courses allowed (e.g. alternate lab)? Do co-requisites apply by grade only, or also by pathway? Who can approve overrides—counselor only, or administrator?

### Integration with an external scheduling platform

The scheduling platform should consume **versioned snapshots** of request data, not a live mutable feed. The canonical store remains per-student `CourseRequest` rows in our system with `updated_at` timestamps. When the cohort (or a subset) is ready to hand off, an export job builds a payload: school year, student identifier, course code, request type (priority/elective), and optional notes—matching the shape already stubbed in `src/lib/export.ts`. Delivery could be a signed secure web request to the scheduler’s import endpoint, a secure file drop (cloud object storage with short-lived access URLs), or a pull model where the scheduler fetches `/exports/{version}`. **Security:** staff authentication on our side (single sign-on), certificate-based encryption for machine-to-machine calls or scoped keys, encryption in transit, and sending only fields the scheduler needs (minimize personally identifiable information beyond student identifier and grade). Credentials rotate on a schedule; export jobs run with least privilege.

Because requests **change after handoff**, each export needs a monotonic `version` or `exportId`. The scheduler should accept either idempotent full replaces per student or an explicit changelog (adds/removes). Our user interface would show **Last sent to scheduling: [date]** and flag **Requests changed since last send** when any underlying row differs from the exported snapshot—similar in spirit to the attention queue in this prototype. Retries use idempotency keys so network failures do not double-enroll students.

**Assumptions & questions to validate:** Is export batch (nightly) or near-real-time required? Does the external system accept deletes, or only adds? Who resolves conflicts when the scheduler cannot place a course—does feedback return to this tool? Is the student identifier scheme shared with the student information system?

### Changing student population

Students transfer in and out continuously; the roster cannot be a static seed file in production. I would model `enrollmentStatus` (`active`, `incoming`, `withdrawn`) and `enrolledAt` / `withdrawnAt` on each student, synced from the student information system on a schedule or via webhooks. **Incoming** students appear in the default counselor view immediately but are prioritized in the attention queue until they have a valid request list (or an explicit “pending transcript” state, as with S010 in the sample data). **Withdrawn** students disappear from the default roster but remain queryable for audit; their requests are frozen or archived, not silently deleted. When a student re-enrolls, merge on stable student information system student identifier so prior request work is recovered where appropriate.

The product experience would extend the prototype’s **needs attention** sort: newly enrolled with zero requests, credit evaluation pending, roster changes since last review, and students whose requests were edited after a scheduling handoff. A header summary (“4 students need requests”) and optional email digest would help counselors operating at scale. Bulk assign templates (e.g. default grade-level core bundle) could accelerate new enrollments without automating judgment. Clear **draft vs. finalized** states would prevent half-finished lists from being sent downstream.

**Assumptions & questions to validate:** Is the student information system the source of truth for roster membership? How quickly must new enrollments appear? Should withdrawn students’ requests be retained for re-enrollment? Do counselors own students by caseload or by grade?
