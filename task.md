# Task List: System Enhancements

- [x] Feature 1: Interactive District Map Overlay & Integration
  - [x] Update [districtmap.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/districtmap.tsx) with overlays, legends, and styling
  - [x] Update [ExecutiveDashboard.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/ExecutiveDashboard.tsx) to mount the map dynamically
- [x] Feature 2: SMS Personalization & Live Previews
  - [x] Implement backend route [route.ts (api/sms/preview)](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/app/api/sms/preview/route.ts)
  - [x] Connect [SMSBroadcasting.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/SMSBroadcasting.tsx) to fetch real previews
- [x] Feature 3: Executive PDF & Excel Report Generator
  - [x] Update [ExcelToolbar.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/ExcelToolbar.tsx) with comprehensive Excel workbook and print/PDF support
  - [x] Add `@media print` layout overrides in [globals.css](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/app/globals.css)
- [x] Feature 4: War Room Live Election Day Simulation
  - [x] Implement backend route [route.ts (api/reset/simulate-turnout)](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/app/api/reset/simulate-turnout/route.ts)
  - [x] Update [WarRoom.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/WarRoom.tsx) with admin simulation controls
- [x] Feature 5: AI Predictive Scoring for Keys
  - [x] Update [ElectoralKeyManagement.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/ElectoralKeyManagement.tsx) to display AI predictive score
  - [x] Update [evaluatekeypage.tsx](file:///c:/Users/SONY/Desktop/aliemad94/aliemad94/src/components/election/evaluatekeypage.tsx) to show predictive risk analysis
- [x] Build & Test Verification
  - [x] Run `npx vitest run` to ensure tests pass
  - [x] Run `npm run build` to ensure the project compiles

## 🌟 2026-06-30 UI Field Removal
- [x] Remove requested fields from official results and dynamic stats views in `ElectionResultsManagement.tsx`

## 🌟 2026-06-30 Automation, AI Action Hub, and Backup System
- [x] Task 1: Update schema.prisma with new fields for EarlyWarning
- [x] Task 2: Implement backups logic in src/lib/backup.ts
- [x] Task 3: Implement scheduler logic in src/lib/scheduler.ts
- [x] Task 4: Integrate scheduler in src/lib/prisma.ts
- [x] Task 5: Add manual backup API route in src/app/api/cron/backup/route.ts
- [x] Task 6: Implement GET & POST handlers in src/app/api/early-warnings/route.ts
- [x] Task 7: Integrate AI Action Hub inside evaluatekeypage.tsx
- [x] Task 8: Verification & compilation (vitest + next build)

## 🌟 2026-06-30 Backup & Restore Center Implementation
- [x] Task 1: Update API route /api/cron/backup to support list, download, and restore actions
- [x] Task 2: Update OwnerPanel.tsx UI to integrate the Backup & Restore UI
- [x] Task 3: Verify and compile the project (vitest + next build)

## 🔐 2026-07-01 Security Hardening Sprint (بناء فوق الموجود بكل المهارات)
- [x] Phase 1: Review & secure pending changes from 2026-06-30 (backup.ts, scheduler.ts, indicators-engine.ts, validators.ts, early-warnings, cron/backup)
- [x] Phase 2: Fix seed.js — remove hardcoded fallback passwords (DhiQarOwner2026!), make ADMIN/USER_PASSWORD env-required with production guard
- [x] Phase 3: Skill-driven fixes (security-architect + code-reviewer + premortem)
  - [x] Fix H-1: Replace `new PrismaClient()` leak in auth/login with shared singleton
  - [x] Fix H-2: Add double-confirmation + ADMIN-only + audit-log + remove GET-mutation for reset/simulate-turnout
  - [x] Fix H-3: Add 5000-row cap, field clamping, ban placeholder cmock keyId on import/bulk
  - [x] Fix 2.1 (Critical): Bind ElectionResultsManagement 2025 literals to ProvinceReference dynamically
  - [x] Fix 2.2 (Critical): Remove hardcoded `digitalCampaigns: 75` in DataAnalysis
  - [x] Fix 2.3: Remove fake fallbacks (855000/58/80/50) in comprehensive-indicators-engine
  - [x] Fix 2.4/2.5: Remove intermediate fallbacks (30/50/80/90) in indicators-engine + UI 58/55
  - [x] Fix 3.1: Guard unguarded `data.districts.forEach` in AdvancedIndicators
  - [x] Fix M-5: Add production runtime guard for BYPASS_AUTH in middleware
  - [x] Fix M-6: Restore endpoint no longer leaks Prisma internals (handleApiError)
  - [x] Fix L-9: health route hides error.message in production
  - [x] Fix premortem E: Add production guard for ALLOW_INSECURE_SEED_DEFAULTS in seed.js
- [x] Phase 4: Final verification (vitest 60/60 ✅ + npm run build ✅)
- [x] Documentation: Update walkthrough.md with full session record

### 🔜 Deferred (fast-follow, lower priority per premortem/code-review)
- [ ] Migrate remaining write routes to Zod: tasks, commission, volunteers, competitors (PUT), sms-campaigns
- [ ] Replace `user: any` with AuthenticatedUser type across 14 route handlers + runtime type-guard
- [ ] Align cookie maxAge (7d) with JWT expiry (8h)
- [ ] Load test indicators dashboard route under concurrency before election day
- [ ] Documented + dry-run recovery runbook (no ALLOW_INSECURE_SEED_DEFAULTS)




