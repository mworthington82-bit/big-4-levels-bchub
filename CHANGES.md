# Big 4: Level Up — Problem Report & Changes Made

**Date:** 18 May 2026  
**Project:** Bradford College — The Big 4: Level Up (React/Vite + Supabase)

---

## The Problem

### What had happened

A previous AI session had been asked to wire up a Supabase backend to the existing app. Instead of connecting the backend to the original pages and content, it:

1. **Created 3 entirely new pages** — `Journey.tsx`, `Module.tsx`, and `ResourcesHub.tsx` — rather than using the originals (`Landing.tsx`, `Training.tsx`, `Resources.tsx`)
2. **Labelled the original pages as "legacy"** in code comments, which caused confusion about which pages were the real ones
3. **Left the new Supabase tables nearly empty** — only 1 of the 11 expected modules (`teams_explorer`) had any content seeded
4. **Wired the navigation incorrectly** in several places, meaning key journeys were broken

The original pages and their content were never deleted — they remained in the codebase but were sidelined. The new system was correctly architected but had no content to deliver, so it appeared broken.

---

## What Was Already Working (Before These Changes)

The Supabase personalization pipeline was correctly built by the previous session:

- Staff profiles pre-loaded by admin CSV upload, each with an `assigned_level` (Explorer / Practitioner / Leader) and tool evidence flags
- `Journey.tsx` reads the staff profile and builds a personalised module card deck — showing "Evidenced", "Completed", or "To do" per tool
- `progression.ts` auto-unlocks the next level when all modules for the current level are complete
- `Module.tsx` queries Supabase for steps and quiz questions, records completion in `module_completions`
- `ResourcesHub.tsx` queries Supabase for resources with bookmarking, filtering, and an AI Activity Planner

The system was correctly wired for bespoke, personalised learning journeys. It just had no content.

---

## The Broken Wiring (4 Issues Fixed)

### 1. Module cards went nowhere (critical)
**File:** `src/components/journey/ModuleCard.tsx` line 74  
**Problem:** Clicking any module card navigated to `/module/teams_explorer`. The route for `/module/:moduleId` in `App.tsx` had a redirect pointing back to `/new/journey` — so clicking a card just looped the user back to the Journey page. No module ever opened.  
**Fix:** Changed `ModuleCard.tsx` to navigate directly to `/new/module/${card.id}`. Also replaced the broken static redirect in `App.tsx` with a proper `ModuleRedirect` component that dynamically forwards `/module/:id` → `/new/module/:id`.

### 2. No link from the home page to Journey
**File:** `src/pages/Landing.tsx`  
**Problem:** After logging in, users land on the home page (`/home`). There was no button or link to the Journey page from there — users had no obvious way to reach their personalised learning journey.  
**Fix:** Added a "My Journey" button to the Landing page header, between the Bradford College logo and the Sign Out button. Navigates to `/journey`.

### 3. Self-assessment sent users to the old Training page
**File:** `src/pages/SelfAssessment.tsx` line 141  
**Problem:** After completing the self-assessment, the "I've Completed the Assessment — Continue" button sent users to `/training` (the old monolithic static Training page). This bypassed the new personalised Journey entirely.  
**Fix:** Changed the button destination to `/journey`, so users land on their personalised module card view after completing the assessment.

### 4. Inclusion Hub quick card linked to the wrong page
**File:** `src/pages/Journey.tsx` line 244  
**Problem:** The "Inclusion Hub" quick-access card on the Journey page linked to `/connect` instead of `/inclusion`.  
**Fix:** Changed the link to `/inclusion`.

### 5. Resources nav link pointed to the old static page
**File:** `src/components/AppShell.tsx` lines 46 and 71  
**Problem:** The "Resources" link in the AppShell navigation (used by Journey, Module, ResourcesHub, Leader pages) pointed to `/resources` — the old static `Resources.tsx` page that reads from hardcoded JavaScript files. The new `ResourcesHub.tsx` (with bookmarking, filtering, and the Activity Planner) was reachable only at `/new/resources`.  
**Fix:** Updated both the desktop and mobile nav links to point to `/new/resources`.

---

## The Content Gap (SQL Migration)

### The source data
All original learning content existed in three static TypeScript data files:

| File | Contents |
|---|---|
| `src/data/pathways.ts` | Full learning pathways for 8 tool/level combinations — intro text, examples, quiz questions (5 per module) |
| `src/data/resources.ts` | 28 resources across all tools and levels — titles, descriptions, URLs, types |
| `src/data/learningObjectives.ts` | Learning objectives for every tool at Explorer, Practitioner, and Leader level |

### What the Supabase tables expected
The new module system expected this data to live in Supabase:

- `modules` — one row per module (module_id, tool, level, title, estimated_minutes)
- `module_steps` — 5 steps per module (intro → learn → outcomes → reflect → assess)
- `quiz_questions` — 5 questions per module with options a/b/c/d and correct_option
- `resources` — resources with tool, level, LEAD stage, type, URL

Only `teams_explorer` was seeded. The other 10 modules showed "This module is being prepared."

### What was created
New migration file: `supabase/migrations/20260518130000_seed_all_modules_and_resources.sql`

This migration seeds:

**10 new modules** (teams_explorer already existed):

| Module ID | Tool | Level |
|---|---|---|
| forms_explorer | MS Forms | Explorer |
| canva_explorer | Canva | Explorer |
| edpuzzle_explorer | Edpuzzle | Explorer |
| copilot_explorer | Microsoft Copilot | Explorer |
| teams_practitioner | MS Teams | Practitioner |
| forms_practitioner | MS Forms | Practitioner |
| canva_practitioner | Canva | Practitioner |
| edpuzzle_practitioner | Edpuzzle | Practitioner |
| copilot_practitioner | Microsoft Copilot | Practitioner |
| immersive_practitioner | Immersive Room | Practitioner |

**50 module steps** (5 per module):

| Step | Type | Source |
|---|---|---|
| 1 | intro | `pathways.ts` intro text and "why it matters" bullets |
| 2 | learn | `pathways.ts` howToUse text and examples list |
| 3 | outcomes | `learningObjectives.ts` objectives for that tool and level |
| 4 | reflect | Authored reflection prompts tailored per tool |
| 5 | assess | Title only — triggers the quiz in Module.tsx |

Learn and reflect steps include `inclusion_note` fields for ESOL/EAL and SEND/low-confidence staff.

**Quiz questions in Supabase (fallback only):**
The original system already had Canva quizzes embedded for 8 modules via `EmbeddedQuiz.tsx`. These are used in preference to Supabase quiz questions.

- `Module.tsx` assess step now checks for a Canva embed URL first (`quizEmbedUrls` in `EmbeddedQuiz.tsx`)
- If a Canva quiz exists for that module: renders the Canva iframe + "I've Completed the Quiz" button
- If no Canva quiz exists (forms_explorer, forms_practitioner, immersive_practitioner): falls back to Supabase `ModuleQuiz` component

The SQL migration includes 15 authored quiz questions for the 3 modules without Canva embeds. The 35 questions for the other modules are seeded but not shown (Canva takes precedence).

**28 resources** converted from `resources.ts`:

| Static field | Supabase column | Mapping applied |
|---|---|---|
| `type: 'video'` | `resource_type` | `'video'` |
| `type: 'pdf'` or `'link'` | `resource_type` | `'guide'` |
| `tool: 'teams'` | `tool` | `'MS Teams'` |
| `tool: 'forms'` | `tool` | `'MS Forms'` |
| `tool: 'canva'` | `tool` | `'Canva'` |
| `tool: 'edpuzzle'` | `tool` | `'Edpuzzle'` |
| `tool: 'copilot'` | `tool` | `'Microsoft Copilot'` |
| `tool: 'immersive'` | `tool` | `'Immersive Room'` |
| `level: 'explorer'` | `level` | `'Explorer'` |
| `level: 'practitioner'` | `level` | `'Practitioner'` |
| `level: undefined` | `level` | `'All'` |
| `lead_stage` (not in static data) | `lead_stage` | `'All'` (default) |

---

## What Was Deleted

Two orphaned page files that were not routed anywhere and served no purpose:

- `src/pages/TempLanding.tsx`
- `src/pages/ResourcesPlaceholder.tsx`

---

## What Was NOT Changed

The following are untouched and remain fully functional:

- `Landing.tsx` — still the post-login home page at `/home`
- `Training.tsx` — still accessible at `/training` via the admin password unlock (5 logo clicks → password `1610`)
- `Resources.tsx` — still accessible at `/resources`
- `Inclusion.tsx`, `Bookings.tsx`, `Planner.tsx`, `SelfAssessment.tsx` (apart from the Continue button fix)
- All Supabase auth logic, staff profile structure, and progression rules
- The self-assessment external Canva form link

---

## How the Personalised Journey Now Works End-to-End

```
1. Staff completes Canva self-assessment (external link)
   → Admin uploads results CSV to Supabase via /admin
   → staff_profiles row created with assigned_level + evidence flags per tool

2. Staff signs in → lands on /home (Landing.tsx)
   → Clicks "My Journey" button in header

3. Journey page (/new/journey) reads their staff_profiles row
   → Builds personalised module card deck:
      "Evidenced" = already proved in self-assessment
      "Completed" = finished the quiz on this platform
      "To do"     = next step on their pathway
   → Shows correct level (Explorer / Practitioner / Leader)

4. Staff clicks a module card
   → Opens /new/module/[module_id] (e.g. /new/module/canva_explorer)
   → Module.tsx loads 5 steps + quiz from Supabase (now seeded)
   → Staff works through Intro → Learn → Outcomes → Reflect → Assess

5. Staff completes the quiz
   → module_completions row written to Supabase
   → progression check runs automatically:
      All 5 Explorer tools done → Practitioner unlocked
      All 6 Practitioner tools done → Leader unlocked
   → Journey page refreshes showing updated progress

6. Staff clicks Resources in nav
   → ResourcesHub (/new/resources) shows all 28 resources
   → Filterable by tool, level, type, LEAD stage
   → Bookmarkable per staff member
   → Activity Planner uses AI edge function to generate lesson ideas
```

---

## One Action Still Required

**Apply the SQL migration to Supabase.** The file is ready at:

```
supabase/migrations/20260518130000_seed_all_modules_and_resources.sql
```

Run via Supabase CLI:
```bash
supabase db push
```

Or paste the file contents into the Supabase dashboard SQL editor and run it. Until this is done, modules will still show "This module is being prepared."

---

## Further Changes (Same Day — Second Session)

### 6. Removed Supabase quiz questions entirely

**Problem:** The original plan had seeded Supabase `quiz_questions` rows and wired a `ModuleQuiz` component as a fallback for modules without Canva embeds (MS Forms and Immersive Room). The user confirmed that MS Forms and Immersive Room intentionally have no quiz, and that no Supabase quiz questions are wanted at all.

**Changes made:**

**`src/pages/Module.tsx`**
- Removed the `ModuleQuiz` import (it had already been removed in the first session)
- Removed the `questions` state variable (`useState<QuizQuestion[]>`)
- Removed the `quiz_questions` Supabase fetch from the `Promise.all` in `useEffect` — the parallel fetch now only queries `modules` and `module_steps`
- Replaced the broken `ModuleQuiz` fallback branch in the assess step with a simple "Mark as complete" button:
  - Clicking it calls `writeCompletion()` (writes to `module_completions` and runs the progression check) then navigates to `/journey`
  - This button is shown for MS Forms and Immersive Room, which have no Canva embed URL in `quizEmbedUrls`
  - All other modules (Teams, Canva, Edpuzzle, Copilot at both levels) continue to show the Canva embedded quiz via `EmbeddedQuiz`

**`supabase/migrations/20260518130000_seed_all_modules_and_resources.sql`**
- Removed all `INSERT INTO quiz_questions` blocks entirely (10 blocks, ~580 lines removed)
- Migration now seeds only: modules, module_steps, and resources

### What the assess step now does per module

| Module | Assess behaviour |
|---|---|
| teams-explorer, teams-practitioner | Canva embedded quiz → on complete → writes completion → back to Journey |
| canva-explorer, canva-practitioner | Canva embedded quiz → on complete → writes completion → back to Journey |
| edpuzzle-explorer, edpuzzle-practitioner | Canva embedded quiz → on complete → writes completion → back to Journey |
| copilot-explorer, copilot-practitioner | Canva embedded quiz → on complete → writes completion → back to Journey |
| forms-explorer, forms-practitioner | "Mark as complete" button → writes completion → back to Journey |
| immersive-practitioner | "Mark as complete" button → writes completion → back to Journey |

### Note on module content authorship

The SQL migration was confirmed to draw directly from the original static data files (`pathways.ts`, `learningObjectives.ts`, `resources.ts`). The three modules not present in `pathways.ts` — **forms_explorer**, **forms_practitioner**, and **immersive_practitioner** — were authored fresh by the AI, drawing on `learningObjectives.ts` entries for those tools. These three modules should be reviewed by the author if exact wording matters.
