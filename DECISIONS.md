# Frontend Architecture & Debugging Decisions

Please answer these four questions concisely before submitting your solution.

## 1. Root-Cause Diagnosis
What caused each of the three reported issues in the starter codebase?
- **Stream cross-contamination:** `handleSelectEvent` opened a `fetch` reader loop with no `AbortController` and no request-identity guard. Clicking Event B left Event A's loop alive, so both loops kept appending decoded chunks into the shared `summaryText` state.
- **Duplicate fetches & broken history navigation:** Two opposing effects formed a feedback loop — Effect A pushed local `search`/`severity` state into the URL via `router.push`, and Effect B wrote `searchParams` back into state. Each navigation re-fired both effects and re-triggered the fetch effect. On top of that, `router.push` ran on every keystroke with no debounce, flooding the history stack so Back/Forward appeared broken.
- **Render cascade during streaming:** `summaryText` lived in the top-level page component. Every streamed chunk called `setSummaryText`, re-rendering the entire tree — all 500 event rows plus `HeavyPayloadFormatter` (~12ms of synchronous work per render) — on a ~45ms token cadence.

## 2. Server vs. Client Component Boundaries
Which parts of the application did you move to Server Components vs. keep as Client Components, and why? What serializable props cross the boundary?

- **Server:** `src/app/page.tsx` is now an async RSC. It awaits `searchParams`, normalizes `search`/`severity`, and filters `ALL_EVENTS` server-side via the shared `filterEvents()` helper (also used by `/api/events`). No client-side fetch exists for the event list, so "no duplicate fetches" holds structurally.
- **Client:** `DashboardClient` owns the two-pane layout and `selectedId`; `FilterBar` handles the draft input + debounced `router.push`; `EventList` renders the memoized rows; `SummaryPanel` owns the streaming lifecycle.
- **Serializable props across the boundary:** `events: SystemEvent[]`, `search: string`, `severity: string` — all plain JSON. No callbacks or class instances cross from server to client; `onSelect` and the stream reader stay entirely client-side.

## 3. Stream Cancellation & Race-Condition Strategy
How did you guarantee that rapid clicks across multiple events never interleave chunks or throw unhandled `AbortError` exceptions? What happens if a user selects Event A -> Event B -> Event A quickly?

`SummaryPanel` runs a `useEffect` keyed on `[event?.id, filtersKey]` (filter changes abort the stream per the spec). Each effect run:

- Creates a fresh `AbortController` and bumps a monotonic `reqIdRef`.
- Passes `signal` to `fetch`; the route handler already honors `request.signal.aborted` and closes the stream.
- Checks `reqIdRef.current !== reqId || signal.aborted` before appending each chunk, so a stale loop can never write even if an abort races a resolved `read()`.
- Wraps the loop in try/catch and swallows `AbortError`; `finally` clears `isStreaming` only if the request is still current.
- Cleanup calls `controller.abort()` and `reader.cancel()` (errors ignored).

For A -> B -> A: B's selection aborts A's first stream, then the second A selection aborts B and starts a brand-new stream with its own `reqId`. The discarded loops may still settle internally, but their chunks fail the reqId/abort check and are dropped — the panel only ever shows the latest request's tokens, with no unhandled rejections.

## 4. State Synchronization & Render Performance
- How did you synchronize filter inputs with `useSearchParams` / `router.replace` (or `push`) without creating a `useEffect` feedback loop?

The URL is the single source of truth — there is no bidirectional sync. `FilterBar` keeps a local `draft` for the text input only. One effect mirrors the committed `search` prop into `draft` (handles mount and Back/Forward); a second effect debounces `draft` for 300ms and `router.push`es `/?search=...&severity=...` **only when `draft !== search`**, which is the guard that prevents a loop — when the RSC round-trips the same value back as a prop, no navigation is re-triggered. Severity changes push immediately as discrete history entries. `useSearchParams` isn't needed at all since params arrive as props, which also avoids the Suspense-boundary requirement.

- How did you verify that token updates in the summary panel no longer trigger re-renders in the event table?

`summaryText`/`isStreaming` live only in `SummaryPanel`, so React's re-render scope is bounded to that subtree — `DashboardClient`, `FilterBar`, and `EventList` never see the state change. Additionally, `EventList`/`EventRow`/`FilterBar` are wrapped in `React.memo` with stable props (`useCallback` for `onSelect`; `filterEvents` preserves event-object identity), and `HeavyPayloadFormatter` no longer accepts `summaryText`, so its 12ms burn runs once per event selection, not per token. Verified via the built-in per-component render counters ("Filter renders", "List renders" stay flat while tokens stream) and can be confirmed in React DevTools Profiler.
