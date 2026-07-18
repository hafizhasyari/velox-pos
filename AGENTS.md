# AGENTS.md

High-signal guidance for agents working on Velox POS. Every line here answers: "Would an agent likely miss this without help?"

---

## Developer Commands

### Required Command Order
```bash
npm run build    # MUST run: tsc -b && vite build (typecheck first, then build)
npm run lint     # oxlint (NOT eslint — no .eslintrc exists)
npm run dev      # Vite dev server on port 5173 (port is hardcoded in test config)
```

### Testing
```bash
npx playwright test                              # All 28 tests × 2 browsers (Chromium + Firefox)
npx playwright test --project=chromium           # Single browser (faster, 28 tests)
npx playwright test e2e/pos-microservices.spec.ts  # Single spec by path
npx playwright show-report                       # View HTML report with traces/screenshots

# Visual regression snapshots
npx playwright test e2e/visual-regression.spec.ts --update-snapshots
```

**Critical:** Tests auto-start dev server via `webServer` config (`reuseExistingServer: true`). Port 5173 is hardcoded in `playwright.config.ts` — do not change it.

---

## Architecture & Structure

### TypeScript Project References
Root `tsconfig.json` references two configs:
- `tsconfig.app.json` — app source (`src/`)
- `tsconfig.node.json` — build tooling (vite.config.ts, playwright.config.ts)

Build command runs `tsc -b` which compiles both projects.

### Microservices Pattern (Frontend Simulation)
10 independent service modules in `src/services/modules/`:
```
authService.ts        — RBAC, login/logout
catalogService.ts     — menu categories & items
orderService.ts       — cart, checkout, order persistence
paymentService.ts     — payment processing
shiftService.ts       — shift open/close, cash reconciliation
kitchenService.ts     — KDS tickets, status transitions
promotionService.ts   — voucher validation & redemption
analyticsService.ts   — dashboard metrics
configService.ts      — tenant config (tax rate, etc.)
roleService.ts        — custom roles & permissions (Owner role management UI)
```

**Adding new service:**
1. Create `src/services/modules/yourService.ts`
2. Wire into `src/hooks/usePosServices.ts`
3. Optionally re-export from `src/services/index.ts` (note: `roleService` is consumed directly from the hook, not re-exported)

### Persistence Layer
- **localStorage key:** `velox_db_v1`
- **Mock database:** `src/services/mocks/mockDatabase.ts`
- State persists across page reloads (intentional for POS use case)
- Tests clear localStorage in `beforeEach` hooks to ensure clean state

### Routing (react-router-dom)
Routes are **screen-name driven**, not static `<Route path=` declarations. `src/App.tsx` resolves `location.pathname` → a `screen` state and renders the matching `*Screen` component (see the `screen === '...'` branches ~line 314). An RBAC route guard (App.tsx:101) redirects unauthorized access.
```
/login       → LoginScreen
/signup      → SignupScreen
/dashboard   → DashboardScreen (Owner only)
/menu        → MenuScreen (Owner only)
/pos         → PosScreen (Owner + Kasir)
/kds         → KdsScreen (Owner + Kasir)
/shift       → ShiftScreen (Owner + Kasir)
/promotions  → PromotionScreen (Owner only)
/settings    → SettingsScreen (Owner only)
```

**RBAC:** Kasir role has restricted nav (POS/KDS/Shift only). Owner has full access.

---

## Testing Workflow

### Playwright Configuration (`playwright.config.ts`)
- **testDir:** `./e2e`
- **workers:** `1` (single worker to avoid localStorage race conditions)
- **baseURL:** `http://localhost:5173` (dev server auto-started)
- **browsers:** Chromium + Firefox (28 tests × 2 = 56 test runs)
- **webServer:** Auto-starts `npm run dev -- --host --port 5173`

### Test Files (8 specs)
```
pos-microservices.spec.ts    — E2E flows 1-9 (auth, order, payment, routing, vouchers)
responsive-layout.spec.ts    — Mobile/tablet/desktop viewport tests
visual-regression.spec.ts    — Screenshot baselines (2% pixel tolerance)
accessibility.spec.ts        — WCAG 2.0 AA audits (@axe-core/playwright)
app-wide-alerts.spec.ts      — Custom AlertNotification (zero native alerts)
kds-precision.spec.ts        — KDS card UI precision checks
dropdown-precision.spec.ts   — Custom select & checkbox theming
signup-alert.spec.ts         — Signup flow validation
```

### Visual Regression Notes
- Snapshots are browser-specific (separate for Chromium/Firefox)
- 2% pixel diff tolerance for font rendering variance
- Update snapshots: `npx playwright test e2e/visual-regression.spec.ts --update-snapshots`

### Common Test Patterns
```typescript
// All tests start with clean localStorage
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// Login as Owner (full access)
await page.click('button:has-text("Owner")');
await page.click('button:has-text("Sign In")');

// Login as Kasir (restricted access)
await page.click('button:has-text("Kasir")');
await page.click('button:has-text("Sign In")');
```

---

## Common Patterns

### Responsive Design Breakpoints
- **Mobile:** `< 640px` — Top header + bottom nav bar + floating order pill
- **Tablet:** `640px - 1024px` — Icon rail sidebar (68px) + slide-up bottom drawer
- **Desktop:** `> 1024px` — Full sidebar (216px) + static right cart column

Viewport hooks: `src/hooks/useViewport.ts` (`isMobile`, `isTablet`, `isDesktop`)

### Component Structure
```
src/components/
  LoginScreen.tsx          — Auth entry point
  Sidebar.tsx              — Main navigation (responsive)
  PosScreen.tsx            — Order/cart/checkout
  KdsScreen.tsx            — Kitchen display system
  ShiftScreen.tsx          — Cash reconciliation
  MenuScreen.tsx           — Menu management (Owner only)
  PromotionScreen.tsx      — Voucher management (Owner only)
  DashboardScreen.tsx      — Analytics (Owner only)
  AlertNotification.tsx    — Custom modal alerts (replaces window.alert)
  CustomSelect.tsx         — Luxury themed select component
```

### No Formatter Config
- **Linter:** oxlint (no ESLint or Prettier config exists)
- Run `npm run lint` before committing
- TypeScript strict flags in `tsconfig.app.json` (noUnusedLocals, noUnusedParameters)

---

## Key Constraints

1. **Build must typecheck first:** `tsc -b && vite build` — don't skip typecheck
2. **Port 5173 required:** Hardcoded in `playwright.config.ts` baseURL and webServer
3. **Single test worker:** `workers: 1` prevents localStorage race conditions
4. **localStorage persistence:** State survives reloads (tests must clear in beforeEach)
5. **Visual snapshots are browser-specific:** Update separately for Chromium/Firefox
6. **React 19 + TypeScript 6:** Use latest syntax (no legacy patterns)

---

## Quick Start Checklist

```bash
npm install                          # Install dependencies
npm run dev                          # Start dev server (http://localhost:5173)
npm run lint                         # Check code quality
npm run build                        # Typecheck + build
npx playwright test --project=chromium  # Run tests (single browser, faster)
```

**Default credentials (mock auth):**
- Owner: Click "Owner" → "Sign In"
- Kasir: Click "Kasir" → "Sign In"

---

**Repo:** Velox POS — F&B Point of Sale with Event-Driven Microservices Architecture  
**Stack:** React 19 + TypeScript 6 + Vite 8 + Playwright 1.61 + oxlint  
**Language:** Indonesian (UI labels, README, comments in Bahasa Indonesia)
