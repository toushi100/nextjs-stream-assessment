# Frontend Architecture & Debugging Decisions

Please answer these four questions concisely before submitting your solution.

## 1. Root-Cause Diagnosis
What caused each of the three reported issues in the starter codebase?
- **Stream cross-contamination:**
- **Duplicate fetches & broken history navigation:**
- **Render cascade during streaming:**

## 2. Server vs. Client Component Boundaries
Which parts of the application did you move to Server Components vs. keep as Client Components, and why? What serializable props cross the boundary?

## 3. Stream Cancellation & Race-Condition Strategy
How did you guarantee that rapid clicks across multiple events never interleave chunks or throw unhandled `AbortError` exceptions? What happens if a user selects Event A -> Event B -> Event A quickly?

## 4. State Synchronization & Render Performance
- How did you synchronize filter inputs with `useSearchParams` / `router.replace` (or `push`) without creating a `useEffect` feedback loop?
- How did you verify that token updates in the summary panel no longer trigger re-renders in the event table?
