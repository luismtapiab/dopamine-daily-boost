# Dopamine Daily Boost — Implementation Plan

A compassion-first, once-a-day wheel that suggests healthy (and honest) alternatives to social media. No accounts, no guilt, just frequency.

---

## Phase 1 Scope (This build)

Core spin experience with localStorage persistence and a memorable user code.

---

## Proposed Changes

### Project Bootstrap

#### [NEW] `D:/projects-personal/dopamine-daily-boost/`
- Scaffold with `npx create-astro@latest` (minimal template)
- Add `@picocss/pico` as dependency
- Add `preact` + `@astrojs/preact` for interactive islands (lighter than Svelte)

---

### Pages

#### [NEW] `src/pages/index.astro` — Home / Spin page
- Daily wheel (spin once per day, locked after use)
- Shows today's suggested activity
- "Done ✓" and "I slipped" buttons
- Displays current streak + memorable code

#### [NEW] `src/pages/log.astro` — History page
- Calendar-like view of past days
- Color coded: done / slipped / skipped
- Slip entries show reflection text

#### [NEW] `src/pages/my-list.astro` — Personal activities
- User can add their own spin entries
- Toggle weight (more likely / less likely to land)

---

### Components (Svelte Islands)

#### [NEW] `src/components/Wheel.tsx`
- Visual spinning wheel using Canvas or CSS conic-gradient
- Weighted random selection (doing > watching > treats)
- Canvas-drawn with smooth easing animation
- Locks after spin for the calendar day

#### [NEW] `src/components/ReflectionForm.tsx`
- Triggered by "I slipped" button
- Fields: what did you do instead + one thing to try tomorrow
- Saves to localStorage, no penalty to streak color (marks differently)

#### [NEW] `src/components/StreakBadge.tsx`
- Shows streak count + memorable code
- Copy-to-clipboard for the code
- Tooltip: "Save this code to recover your streak on another device"

---

### Data & Identity

#### [NEW] `src/lib/identity.ts`
- Generates a short memorable code on first visit: `adjective-noun-number` (e.g., `calm-river-47`)
- Stored in localStorage under `ddb:code`
- Also stores a UUID internally for future Supabase sync

#### [NEW] `src/lib/storage.ts`
- Typed wrappers for all localStorage keys:
  - `ddb:code` — memorable code
  - `ddb:uuid` — internal UUID
  - `ddb:streak` — current streak count
  - `ddb:history` — array of day entries `{ date, activity, status, reflection }`
  - `ddb:mylist` — user's personal activity entries

#### [NEW] `src/lib/activities.ts`
- Curated default pool with weights:
  - **Doing** (weight 5): cook, sketch, walk, call someone, play instrument, fix one thing
  - **Watching** (weight 2): one great episode, short doc, concert recording
  - **Treats** (weight 3): favorite snack, nap, timed YouTube, reread something
  - **Wildcards** (weight 2): postponed task, random fact, kind act

---

### Styling

- Pico.css as base (semantic HTML, no utility classes)
- Custom CSS variables for palette: warm earthy tones, calm feel
- Subtle spin animation on the wheel
- Responsive, mobile-first

---

## Decisions Resolved

- **Wheel**: Canvas with smooth easing animation ✓
- **Island framework**: Preact (lighter weight) ✓
- **Slip penalty**: No streak break, different day marker. After 3+ consecutive slips, show gentle message: *"Hope you are managing better your distractions — once you take your daily dosage."* ✓
- **Personal list weighting**: Users tag each entry as `healthy` or `not` — healthy entries get a higher weight multiplier in the wheel pool. Otherwise equal to curated entries. ✓

---

## Verification Plan

- Spin works once per day, locked afterward with countdown to midnight reset
- Streak increments correctly on "Done", marks differently on "Slip"
- Memorable code persists across page reloads
- Personal list entries appear in the wheel pool
- Reflection saves and shows in log page