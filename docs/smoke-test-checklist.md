# Manual Smoke Test Checklist

Cross-mode (light/dark) and cross-role (admin, editor, viewer) smoke test for the OEF City Climate Action Tracker.

**Prerequisites:**
- Local dev server running (`npm run dev`)
- Clerk configured with at least one organization (admin, editor, viewer users)
- Supabase running with seed data applied
- A second Clerk org that is NOT mapped to any Organization record (for onboarding test)

---

## 1. Landing Page (`/`)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 1.1 | Hero renders with gradient sky background, leaf icon, product name, value prop | ☐ | ☐ |
| 1.2 | Primary CTA scrolls to `#cities` directory section | ☐ | ☐ |
| 1.3 | Secondary CTA links to `/admin` | ☐ | ☐ |
| 1.4 | Feature explainer shows 3 cards with nature icons | ☐ | ☐ |
| 1.5 | City directory cards display city name, org name, target year, action count, total reduction | ☐ | ☐ |
| 1.6 | Directory search filters cards by city/org name (case-insensitive, <100ms) | ☐ | ☐ |
| 1.7 | Clicking a directory card navigates to `/cities/[citySlug]` | ☐ | ☐ |
| 1.8 | When signed in, header shows "Open admin" instead of "Sign in" | ☐ | ☐ |
| 1.9 | Empty state renders if no cities exist (with link to `/admin`) | ☐ | ☐ |

---

## 2. Public Dashboard (`/cities/[citySlug]`)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 2.1 | City name, baseline emissions, target year display in header | ☐ | ☐ |
| 2.2 | KPI summary: total reductions, percent of baseline (1 decimal), action count, on-track badge | ☐ | ☐ |
| 2.3 | Sector breakdown chart (donut) renders with correct sector colors | ☐ | ☐ |
| 2.4 | Emissions projection chart (line) renders with projected/baseline/target traces | ☐ | ☐ |
| 2.5 | Progress gauge chart renders with color zones | ☐ | ☐ |
| 2.6 | Actions list table shows title, sector, reduction, status, start year | ☐ | ☐ |
| 2.7 | Chart theming updates correctly when toggling light/dark | ☐ | ☐ |
| 2.8 | Non-existent slug shows 404 page | ☐ | ☐ |
| 2.9 | City with zero actions shows empty state (all KPIs zero, indeterminate badge, message) | ☐ | ☐ |

---

## 3. Sign-In / Sign-Up

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 3.1 | `/sign-in` renders Clerk sign-in with Design System styling | ☐ | ☐ |
| 3.2 | `/sign-up` renders Clerk sign-up with Design System styling | ☐ | ☐ |
| 3.3 | Accessing `/admin` while unauthenticated redirects to `/sign-in` | ☐ | ☐ |
| 3.4 | After sign-in, user is returned to originally requested admin path | ☐ | ☐ |

---

## 4. Onboarding Wizard (`/admin/onboarding`)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 4.1 | Unmapped Clerk org admin is redirected to `/admin/onboarding` | ☐ | ☐ |
| 4.2 | Form shows org name, org slug, city name, city slug, baseline, target year | ☐ | ☐ |
| 4.3 | Client-side validation shows field-level errors | ☐ | ☐ |
| 4.4 | Successful submit creates org + city and redirects to `/admin` | ☐ | ☐ |
| 4.5 | Duplicate slug shows field-level error without creating records | ☐ | ☐ |
| 4.6 | Non-admin Clerk user sees "contact your org admin" message (form hidden) | ☐ | ☐ |

---

## 5. Admin Home (`/admin`)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 5.1 | Org-level KPI snapshot: total cities, total actions, total reduction | ☐ | ☐ |
| 5.2 | City list rows: name, action count, total reduction, on-track badge, "Manage" link | ☐ | ☐ |
| 5.3 | "Manage" link sets active city and navigates to `/admin/settings` | ☐ | ☐ |
| 5.4 | Empty state renders when org has zero cities (CTA to onboarding) | ☐ | ☐ |
| 5.5 | Skeleton loading state appears during page transition | ☐ | ☐ |

---

## 6. Admin Shell (top nav)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 6.1 | Brand mark (leaf icon) visible | ☐ | ☐ |
| 6.2 | Clerk OrganizationSwitcher renders and switches orgs | ☐ | ☐ |
| 6.3 | Clerk UserButton renders with sign-out option | ☐ | ☐ |
| 6.4 | Theme toggle switches all surfaces (including charts) without reload | ☐ | ☐ |
| 6.5 | Nav links: Home, Settings, Actions, Import, Imports, Analytics — active link styled | ☐ | ☐ |
| 6.6 | City Switcher appears when org has >1 city | ☐ | ☐ |
| 6.7 | City Switcher hidden when org has exactly 1 city | ☐ | ☐ |
| 6.8 | Switching city via CitySwitcher updates all admin page data | ☐ | ☐ |

---

## 7. City Settings (`/admin/settings`)

| # | Check | Light | Dark | Admin | Editor | Viewer |
|---|-------|:-----:|:----:|:-----:|:------:|:------:|
| 7.1 | Form pre-populated with current city name, baseline, target year | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7.2 | Form is editable for admin/editor | ☐ | ☐ | ☐ | ☐ | — |
| 7.3 | Form is read-only (inputs disabled) for viewer | ☐ | ☐ | — | — | ☐ |
| 7.4 | Save button hidden for viewer | ☐ | ☐ | — | — | ☐ |
| 7.5 | Client-side validation shows field-level errors | ☐ | ☐ | ☐ | ☐ | — |
| 7.6 | Success toast appears after save | ☐ | ☐ | ☐ | ☐ | — |
| 7.7 | Error toast appears on server failure (form input preserved) | ☐ | ☐ | ☐ | ☐ | — |
| 7.8 | Skeleton loading state on page transition | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 8. Climate Actions CRUD (`/admin/actions`)

| # | Check | Light | Dark | Admin | Editor | Viewer |
|---|-------|:-----:|:----:|:-----:|:------:|:------:|
| 8.1 | Actions table shows title, sector, reduction, status, start year | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8.2 | Edit/Delete buttons visible for admin/editor | ☐ | ☐ | ☐ | ☐ | — |
| 8.3 | Edit/Delete buttons hidden for viewer | ☐ | ☐ | — | — | ☐ |
| 8.4 | "Add action" button hidden for viewer | ☐ | ☐ | — | — | ☐ |
| 8.5 | Create form validates and shows field-level errors | ☐ | ☐ | ☐ | ☐ | — |
| 8.6 | Success toast on create/update/delete | ☐ | ☐ | ☐ | ☐ | — |
| 8.7 | Delete confirmation dialog appears; cancel retains record | ☐ | ☐ | ☐ | ☐ | — |
| 8.8 | Table refreshes after mutation | ☐ | ☐ | ☐ | ☐ | — |
| 8.9 | Empty state when city has zero actions | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8.10 | Skeleton loading state on page transition | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 9. Import Flow (`/admin/import`)

| # | Check | Light | Dark | Admin | Editor | Viewer |
|---|-------|:-----:|:----:|:-----:|:------:|:------:|
| 9.1 | Import textarea and submit button visible for admin/editor | ☐ | ☐ | ☐ | ☐ | — |
| 9.2 | Read-only message shown for viewer | ☐ | ☐ | — | — | ☐ |
| 9.3 | Validation error for empty or >10000 char input | ☐ | ☐ | ☐ | ☐ | — |
| 9.4 | Review interface shows extracted actions with editable fields | ☐ | ☐ | ☐ | ☐ | — |
| 9.5 | Individual actions removable from review | ☐ | ☐ | ☐ | ☐ | — |
| 9.6 | Approve persists actions and shows success toast | ☐ | ☐ | ☐ | ☐ | — |
| 9.7 | Error toast on extraction failure with retry option | ☐ | ☐ | ☐ | ☐ | — |
| 9.8 | Skeleton loading state on page transition | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 10. Imports History (`/admin/imports`)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 10.1 | Table shows provider, model, status badge, created_at | ☐ | ☐ |
| 10.2 | "View" button opens detail dialog with input_text and parsed_json | ☐ | ☐ |
| 10.3 | Dialog closes on Escape, click-outside, and close button | ☐ | ☐ |
| 10.4 | Empty state with link to `/admin/import` when no imports exist | ☐ | ☐ |
| 10.5 | Skeleton loading state on page transition | ☐ | ☐ |

---

## 11. Analytics (`/admin/analytics`)

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 11.1 | Emissions projection chart renders | ☐ | ☐ |
| 11.2 | Sector breakdown chart renders | ☐ | ☐ |
| 11.3 | Annual reduction bar chart renders (grouped by year, colored by sector) | ☐ | ☐ |
| 11.4 | Recent imports subsection shows last 5 imports with "View all" link | ☐ | ☐ |
| 11.5 | Chart theming updates on light/dark toggle without reload | ☐ | ☐ |
| 11.6 | Skeleton loading state on page transition | ☐ | ☐ |

---

## 12. Cross-Cutting Concerns

| # | Check | Light | Dark |
|---|-------|:-----:|:----:|
| 12.1 | Theme toggle persists across page navigations | ☐ | ☐ |
| 12.2 | All surfaces (cards, inputs, tables, dialogs, toasts) respect active theme | ☐ | ☐ |
| 12.3 | Toast auto-dismisses (5s success/warning, 8s error) | ☐ | ☐ |
| 12.4 | Toast close button works | ☐ | ☐ |
| 12.5 | No sensitive data (API keys, stack traces) leaks into toast messages | ☐ | ☐ |
| 12.6 | WCAG AA contrast maintained in both modes (spot-check buttons, text, badges) | ☐ | ☐ |
| 12.7 | Skeletons show `aria-busy="true"` (inspect DOM) | ☐ | ☐ |
| 12.8 | Empty states are accessible (descriptive text, actionable CTA) | ☐ | ☐ |

---

## Sign-Off

| Tester | Date | Result | Notes |
|--------|------|--------|-------|
| | | ☐ Pass / ☐ Fail | |
