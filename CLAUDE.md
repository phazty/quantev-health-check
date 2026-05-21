# Quantev Health Check Tool — CLAUDE.md

Enterprise EV charger NOC/operations dashboard. Desktop-first React SPA acting as a hybrid mission-control + enterprise SaaS tool.

---

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + TypeScript | 19.2.6 / ~6.0.2 |
| Build | Vite | ^8.0.12 |
| Styling | Tailwind CSS | ^3.4.19 (darkMode: `["class"]`) |
| Components | shadcn/ui (local copies) | Radix UI primitives |
| State | Zustand + immer | ^5.0.13 / ^11.1.8 |
| Table | TanStack Table | ^8.21.3 |
| Animation | Framer Motion | ^12.40.0 |
| Routing | React Router | ^7.15.1 |
| Icons | Lucide React | ^1.16.0 |
| Dates | date-fns | ^4.2.1 |

**Node**: v24.15.0 · **npm**: v11.12.1

---

## Import Alias

`@/` → `./src/` (configured in both `vite.config.ts` and `tsconfig.app.json`)

`tsconfig.app.json` requires `"ignoreDeprecations": "6.0"` (TS 7.0 compat), `"types": ["vite/client"]` (CSS imports), `noUnusedLocals/Parameters: false`.

---

## Design Tokens (tailwind.config.js)

- **Navy**: `#0F172A` (light: `#1E293B`, lighter: `#334155`)
- **Orange**: `#EA580C` (light: `#F97316`, dark: `#C2410C`)
- **Canvas**: `#F8FAFC`
- Dark mode: class strategy, inline script in `index.html` reads `localStorage` before hydration
- Font: Inter via `@fontsource/inter` (imported in `main.tsx`)

---

## Folder Structure

```
src/
├── app/
│   └── router.tsx              # createBrowserRouter, 5 routes under DesktopLayout
├── components/
│   ├── primitives/
│   │   ├── AnimatedCounter.tsx  # rAF count-up, cubic ease-out
│   │   ├── LiveCell.tsx         # memo, 700ms orange flash on value change > threshold
│   │   ├── LoadingState.tsx
│   │   ├── SeverityBadge.tsx
│   │   ├── StatusPulse.tsx
│   │   ├── TelemetryCard.tsx    # + ScorecardMetric export
│   │   └── WebSocketIndicator.tsx
│   └── ui/                     # shadcn/ui owned copies
│       ├── badge.tsx            # CVA variants: critical/high/medium/low/info/online/offline/faulted/suspended/unavailable
│       ├── button.tsx           # CVA variants: navy/navy-ghost/orange/orange-outline + icon-sm/icon-xs sizes
│       ├── card.tsx
│       ├── dialog.tsx           # Full Radix Dialog
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx         # Radix Progress, translateX animation
│       ├── scroll-area.tsx
│       ├── select.tsx           # Full Radix Select with scroll buttons
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── toast.tsx + toaster.tsx  # variants: success/warning/critical
│       └── tooltip.tsx
├── data/                       # Seed data (static)
│   ├── auditLogs.ts            # 15 AuditEvents + 8 CommandLogs
│   ├── chargers.ts             # 35 chargers, buildCharger() factory, generateInitialTelemetry()
│   ├── protocolMappings.ts     # 10 MappingEntry items
│   ├── sites.ts                # 6 sites: site-atx/sfo/ord/mia/den/sea
│   └── users.ts                # 8 users; currentUser = users[1] (Marcus Chen, administrator)
├── features/
│   ├── automation/
│   │   ├── AnimatedQueueCard.tsx  # motion.div, layout animation, spring transition
│   │   ├── AssignModal.tsx        # Operator assignment dialog → automationStore.assignOperator
│   │   └── TicketModal.tsx        # Jira/Salesforce ticket dialog → remediationService.createTicket
│   └── dashboard/
│       ├── ChargerTable.tsx       # TanStack Table v8, LiveCell, custom severity sort, getRowId
│       ├── DashboardScorecards.tsx # 5 AnimatedCounter scorecards
│       └── useDashboardMetrics.ts  # Derived metrics hook
├── floating-windows/
│   └── WindowManager.tsx       # STUB — returns null. Phase 3 target.
├── hooks/
│   └── useNotifications.ts     # useToast + toast, global listener pattern (not Zustand)
├── layouts/
│   ├── DesktopLayout.tsx        # flex h-screen w-screen overflow-hidden bg-navy
│   ├── NavigationConfig.ts      # NAV_ITEMS array (5 items)
│   ├── SideNav.tsx              # Collapsed(w-16)/expanded(w-56), orange Zap logo, collapse toggle at -right-3
│   └── WorkspaceArea.tsx        # DisconnectBanner + Outlet
├── pages/
│   ├── AccessControlPage.tsx    # User table + permissions matrix
│   ├── AutomationPage.tsx       # AnimatePresence lanes + TicketModal + AssignModal
│   ├── DashboardPage.tsx        # SiteSelector + DashboardScorecards + ChargerTable
│   ├── ObservabilityPage.tsx    # Event stream + command log
│   └── ProtocolAdminPage.tsx    # Inline-editable vendor table
├── services/
│   ├── chargerService.ts        # getChargers, getCharger, getTelemetry, forceRefreshTelemetry
│   ├── remediationService.ts    # enqueueCharger, executeCommand, createTicket
│   └── websocketSimulator.ts    # Singleton. 6 intervals: telemetry(3500ms), queue(5000ms),
│                                #   heartbeat(8000ms), stale(20000ms), audit(12000ms), disconnect(60000ms/8%)
├── stores/
│   ├── auditStore.ts            # Ring buffer: max 1000 events, 500 command logs
│   ├── automationStore.ts       # scanningLane/activeLane/interventionLane, velocity, pause
│   ├── chargerStore.ts          # chargers + telemetry + sites, updateTelemetry/markStale
│   ├── uiStore.ts               # Persisted (theme+sidebarCollapsed→"quantev-ui-state"). FloatingWindow type.
│   ├── userStore.ts             # currentUser=Marcus Chen, team, pendingInvites
│   └── websocketStore.ts        # status/latency/eventBuffer(200)
├── types/
│   ├── audit.ts, charger.ts, index.ts, protocol.ts, remediation.ts, user.ts, websocket.ts
└── utils/
    ├── cn.ts                    # clsx + twMerge
    ├── delays.ts                # sleep, jitter, simulateApiCall, randomBetween/Int/Pick
    ├── formatters.ts            # formatPower/Energy/Voltage/Current/Temperature/Percent + staleness()
    └── severity.ts              # SEVERITY_LABEL/BG/DOT/ROW_HIGHLIGHT/ORDER maps + maxSeverity()
```

---

## Data Model

**Charger IDs**: `chg-001` – `chg-035`  
**Site IDs**: `site-atx`, `site-sfo`, `site-ord`, `site-mia`, `site-den`, `site-sea`  
**User IDs**: `usr-001` – `usr-008`

**Fault distribution in seed data:**
- Load sharing fault: chg-003, 007, 009, 015, 025
- Heartbeat drift: chg-005, 012, 020, 022, 028
- Phase rotation: chg-018, 029
- Auth drift: chg-010, 017, 024, 034
- Offline: chg-011, 026
- Locked: chg-032

---

## Zustand Store Patterns

```ts
// Regular store
create<State>()(immer((set, get) => ({ ... })))

// Persisted store (uiStore only)
create<State>()(persist(immer(...), {
  name: "quantev-ui-state",
  partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed })
}))
```

**uiStore.openWindow(chargerId)**: stacks windows with 30px offset, manages `windowZCounter`. FloatingWindow shape: `{ id, chargerId, position: {x,y}, zIndex, isMinimized }`.

---

## App Entry Points

- `src/App.tsx` — ThemeSync (syncs uiStore.theme → `document.documentElement` class), starts `wsSimulator`, renders `RouterProvider + WindowManager + Toaster`
- `index.html` — inline script reads `localStorage` for dark mode before hydration
- `src/main.tsx` — imports Inter font weights, renders App in StrictMode

---

## Key Component Contracts

### ChargerTable
- Reads `chargerStore.chargers`, `chargerStore.telemetry`, `chargerStore.sites`, `uiStore.activeSiteFilter`
- Builds `ChargerRow[]` in useMemo (recomputes on any telemetry tick)
- Pre-filters rows by site, then by text search before passing to TanStack Table
- `getRowId: (row) => row.id` — preserves LiveCell state across sort reorders
- Default sort: `severity asc` (critical first, null/"clean" last via order=99)

### AnimatedQueueCard
- Requires `AnimatePresence mode="popLayout"` as parent to animate exits
- `layout` prop enables smooth reorder animations when siblings are added/removed
- `onTicket/onAssign/onRetry` callbacks only rendered for `lane="intervention"`

### WebSocketSimulator (`wsSimulator` singleton)
- Started once in `App.tsx` useEffect
- `pushTelemetryUpdates`: picks 3–6 random online chargers, mutates voltage/current/power/temperature
- `advanceQueue`: tick thresholds slow=6/normal=4/fast=2; 25% fail rate → intervention lane
- `simulateDisconnect`: 8% chance per 60s tick; reconnects after 2–6s

---

## Button Variants

`variant` prop values: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `navy`, `navy-ghost`, `orange`, `orange-outline`

`size` prop values: `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-xs`

---

## Build / Dev Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (tsc + vite build)
npm run lint     # ESLint
```

---

## Phase Status

### ✅ Phase 1 — Scaffold & Architecture
All infrastructure: Vite config, Tailwind tokens, shadcn/ui base components, 6 Zustand stores, 3 services, WebSocket simulator, layout system (SideNav + WorkspaceArea + DesktopLayout), all 5 page stubs.

### ✅ Phase 3 — Floating Multi-Window Diagnostic System
- `src/floating-windows/DiagnosticWindow.tsx` — Framer Motion draggable window, `useMotionValue` for x/y, `dragConstraints={containerRef}`, minimize/close/bring-to-front, live telemetry grid, connector list, config drift diff (red→green), active errors
- `src/floating-windows/WindowManager.tsx` — `z-[30]` fixed overlay, `AnimatePresence`, maps `uiStore.openWindows` → DiagnosticWindow
- `src/pages/ObservabilityPage.tsx` — text search across message+chargerName+details, expandable command log entries (click to show payload)
- `src/pages/AccessControlPage.tsx` — InviteModal (email+role → `addInvite`), inline Revoke confirm flow, pending invites section with cancel

### ✅ Phase 2 — Live Data & Queue Orchestration
- Dashboard: `useDashboardMetrics`, `DashboardScorecards` (AnimatedCounter), `ChargerTable` (TanStack Table + LiveCell)
- Automation: `AnimatedQueueCard` (Framer Motion), `TicketModal` (Jira/Salesforce), `AssignModal` (operator select)
- Page rewrites: DashboardPage and AutomationPage use all new feature components


### ✅ Phase 4 — Polish
- **Code splitting**: All 5 route pages are `lazy()` + `Suspense<FullPageSpinner>`. Main bundle 780 kB → 628 kB. Pages load as separate chunks on first nav.
- **Page transitions**: `key={location.pathname}` on `<main>` + `animate-fade-in` CSS (0.25s ease-out, 6px Y lift). Triggers on every route change.
- **Overflow fix**: `main` changed from `overflow-auto` to `overflow-hidden` — all pages own their scroll via internal `ScrollArea`.
- **Accessibility**: `DisconnectBanner` gets `role="status" aria-live="assertive"`. Notifications button: `aria-label` with unread count. DiagnosticWindow close/minimize: `aria-label`. Grip icon: `aria-hidden="true"`.
- **Dark mode audit**: CSS variables cover all semantic colors. `bg-navy` in sidebar/tooltip/window title bar is intentional (always-dark brand surfaces). No hard-coded color issues found.
- **Mono font stack**: Added `ui-monospace → SFMono-Regular → Menlo → Consolas` fallback chain before generic `monospace`.
- **Empty state**: ChargerTable shows a contextual message (`No devices match "…"` vs `No devices in this view`) when filter returns 0 rows.

---

## Known Notes

- Chunk size warning on build is expected (Framer Motion + TanStack + Radix unbundled). Code-split in Phase 4.
- `@radix-ui/react-badge` does NOT exist as an npm package — Badge is a pure CVA component in `src/components/ui/badge.tsx`.
- `remediationService.createTicket` only works for items in `interventionLane` (store lookup by id).
- `uiStore.activeSiteFilter` is NOT persisted (intentional — resets on reload).
