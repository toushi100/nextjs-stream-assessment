# Frontend Technical Assessment — Event Log & Live AI Summary Workspace

## Context
You are taking over an internal operations dashboard built with **Next.js (App Router)**, **React**, and **TypeScript**. The workspace displays a filterable list of 500 system events on the left and a live streaming AI incident-summary drawer on the right.

Users are reporting three major issues in production:
1. **Stream Cross-Contamination:** Clicking Event A starts a streaming summary; clicking Event B before Event A finishes causes leftover chunks from Event A to bleed into Event B's summary panel.
2. **Sluggish Typing & Broken Back Button:** Typing in the search box or toggling severity filters triggers duplicate API calls and breaks browser Back/Forward navigation.
3. **UI Jank During Streaming:** While a summary is streaming tokens, typing or scrolling feels sluggish because the entire 500-row table and heavy syntax formatter re-render on every single streamed chunk.

## Setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## Acceptance Criteria
1. **Zero Stream Bleed:** Rapidly switching between events (or changing filters while a stream is active) must cleanly abort in-flight streams and never append stale chunks to the newly selected event.
2. **URL-Driven Filter State:** `search` and `severity` filters must stay synchronized with URL query parameters (`?search=...&severity=...`) with **no duplicate fetches** on mount/change, proper debouncing on search input, and working browser Back/Forward navigation.
3. **Render Isolation:** Streaming token updates must **only** re-render the leaf summary output component—never the 500-row event list or filter bar (verifiable via React DevTools Profiler or the built-in render counters).
4. **Server/Client Boundary Hygiene:** Move initial data loading and shell layout to React Server Components where appropriate instead of making the entire page `'use client'`.

## Constraints
- **No external state or data-fetching libraries:** Do not install Zustand, Redux, Jotai, TanStack Query, or SWR. Solve state and cancellation using native React and Next.js App Router primitives.
- Complete `DECISIONS.md` before submitting.
