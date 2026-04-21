# Implementation Plan: System Design Interview App

## Overview

Build a Vite + React + TypeScript SPA that presents 32 system design topics for active-recall practice. A Python script extracts PDF content at build time into static JSON files; the React app reads those files at runtime and manages study sessions with Redux Toolkit, persisting progress to localStorage.

## Tasks

- [x] 1. Set up project scaffolding
  - Initialise the `app/` directory with Vite + React + TypeScript template (`npm create vite@latest app -- --template react-ts`)
  - Install runtime dependencies: `react-router-dom@6`, `@reduxjs/toolkit`, `react-redux`
  - Install dev/test dependencies: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `jsdom`
  - Configure `vite.config.ts` with `test` block: `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/test/setup.ts']`
  - Create `src/test/setup.ts` importing `@testing-library/jest-dom`
  - Create `app/public/data/` directory (add `.gitkeep`)
  - Add `package.json` scripts: `"extract": "python ../extract_pdfs.py --pdf-dir .. --output-dir public/data"`, `"prebuild": "npm run extract"`, `"build": "vite build"`, `"dev": "vite"`, `"test": "vitest --run"`
  - Create `requirements.txt` at workspace root with `pypdf`
  - _Requirements: 6.1, 6.12_

- [x] 2. Define TypeScript types
  - Create `src/types/design.ts` with all interfaces: `DesignContent`, `DesignSummary`, `DesignIndex`, `StandardTopicContent`, `HLDTopicContent`, `HLDQuestion`, `Approach`, `SystemArchitectureTable`, `DeepDiveTopicContent`, `DeepDiveQuestion`, `DesignTopicContent`, `AttemptProgress`, `TopicKey`
  - Export a `TOPIC_ORDER` constant (`readonly` array of `TopicKey` values in the fixed display order)
  - _Requirements: 3.1, 6.7, 6.8, 6.10_

- [x] 3. Implement Redux store
  - [x] 3.1 Create `src/store/progressSlice.ts`
    - State shape: `{ records: Record<string, AttemptProgress>; hydrated: boolean }`
    - Actions: `hydrateProgress(records)`, `upsertProgress(progress)`, `clearProgress(designId)`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.2 Create `src/store/attemptSlice.ts`
    - State shape: `AttemptState` (designId, currentStep, revealedTopics, revealedQuestions, completed)
    - Actions: `initAttempt(designId)` (seeds from progressSlice or creates fresh), `navigateTo(step)`, `revealTopic(topicKey)`, `revealQuestion({ topicKey, index })`, `markComplete()`, `resetAttempt()`
    - _Requirements: 4.3, 5.6, 7.1, 7.2_

  - [x] 3.3 Create `src/store/contentSlice.ts`
    - State shape: `{ index: DesignSummary[] | null; designs: Record<string, DesignContent>; loading: Record<string, boolean>; errors: Record<string, string | null> }`
    - Async thunks: `fetchIndex()` (fetches `/data/index.json`), `fetchDesignContent(designId)` (fetches `/data/<designId>.json`, no-op if already cached)
    - _Requirements: 1.1, 6.12_

  - [x] 3.4 Create `src/store/localStorageMiddleware.ts`
    - Middleware listens for `upsertProgress` → writes `sdia_progress_<designId>` to localStorage; listens for `clearProgress` → removes the key; swallows localStorage exceptions silently
    - Export `loadAllProgressFromStorage(): Record<string, AttemptProgress>` that reads all `sdia_progress_*` keys, skipping corrupt/missing values
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 3.5 Create `src/store/index.ts`
    - Wire `configureStore` with all three reducers and `localStorageMiddleware`
    - Export `RootState`, `AppDispatch`, typed `useAppSelector` and `useAppDispatch` hooks
    - _Requirements: 7.1_

  - [ ]* 3.6 Write unit tests for Redux slices and middleware
    - `progressSlice`: `hydrateProgress` populates records; `upsertProgress` adds/updates; `clearProgress` removes only the target design
    - `attemptSlice`: `initAttempt` seeds from progress; `revealTopic` marks topic; `revealQuestion` appends index; `navigateTo` updates step; `resetAttempt` clears state
    - `localStorageMiddleware`: `upsertProgress` writes correct key; `clearProgress` removes it; localStorage errors are swallowed
    - `loadAllProgressFromStorage`: returns empty object when storage is empty; skips corrupt keys; correctly parses valid entries
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.7 Write property test — Progress store round-trip (Property 3)
    - **Property 3: Progress store round-trip**
    - **Validates: Requirements 4.4, 5.7, 7.1, 7.2, 7.3**

  - [ ]* 3.8 Write property test — Progress isolation between designs (Property 4)
    - **Property 4: Progress isolation between designs**
    - **Validates: Requirements 7.5**

  - [ ]* 3.9 Write property test — localStorage sync middleware fires on state mutations (Property 11)
    - **Property 11: localStorage sync middleware fires on state mutations**
    - **Validates: Requirements 7.1, 7.2**

- [ ] 4. Checkpoint — Ensure all store tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement custom hooks
  - [x] 5.1 Create `src/hooks/useDesignContent.ts`
    - Dispatches `fetchDesignContent(designId)` on mount (no-op if cached); selects `designs[designId]`, `loading[designId]`, `errors[designId]` from `contentSlice`
    - Returns `{ content: DesignContent | null; loading: boolean; error: string | null }`
    - _Requirements: 6.12_

  - [x] 5.2 Create `src/hooks/useAttemptProgress.ts`
    - Reads from `state.attempt` via `useAppSelector`; exposes `revealTopic`, `revealQuestion`, `navigateTo`, `markComplete` as dispatch wrappers
    - _Requirements: 4.3, 5.6, 7.1, 7.2_

  - [ ]* 5.3 Write property test — Revealed topics persist across navigation (Property 5)
    - **Property 5: Revealed topics persist across navigation**
    - **Validates: Requirements 4.3**

- [x] 6. Implement `ProgressBar` component
  - Create `src/components/ProgressBar.tsx` accepting `{ current: number; total: number }` props
  - Render a step indicator showing `current + 1` of `total` (e.g., "Step 2 of 9")
  - Use semantic HTML (`<nav aria-label="progress">` or equivalent) with visible focus indicators
  - _Requirements: 3.2, 9.2, 9.3_

  - [ ]* 6.1 Write property test — Progress indicator correctness (Property 7)
    - **Property 7: Progress indicator correctness**
    - **Validates: Requirements 3.2**

- [x] 7. Implement `ApproachCard` component
  - Create `src/components/ApproachCard.tsx` accepting `{ approach: Approach; isRecommended: boolean }` props
  - Render approach title, description, and trade-off line
  - When `isRecommended` is true: apply green border styling and render a "Recommended" badge
  - When `isRecommended` is false: apply neutral/warning styling; no badge
  - _Requirements: 5.2_

  - [ ]* 7.1 Write unit tests for `ApproachCard`
    - Renders title, description, trade-off for a non-recommended approach (no badge, no green border class)
    - Renders "Recommended" badge and green border class when `isRecommended` is true
    - _Requirements: 5.2_

- [x] 8. Implement `TopicView` component
  - Create `src/components/TopicView.tsx` accepting `{ topic: StandardTopicContent | DesignTopicContent; topicKey: TopicKey; revealed: boolean; onReveal: () => void }` props
  - When `revealed` is false: show a topic prompt and "Reveal Answer" button; hide content
  - When `revealed` is true and `topicKey !== 'design'`: render `topic.content` as plain text/markdown
  - When `revealed` is true and `topicKey === 'design'`: render `topic.diagram` followed by each item in `topic.keyFlows` as a list
  - Ensure no layout shift when content is revealed (pre-allocate space or use smooth transition)
  - _Requirements: 4.1, 4.2, 8.1, 8.2, 9.4_

  - [ ]* 8.1 Write unit tests for `TopicView`
    - Hides content and shows "Reveal Answer" button when `revealed` is false
    - Shows full `content` string when `revealed` is true for a standard topic
    - Renders `diagram` and all `keyFlows` items when `revealed` is true for the Design topic
    - _Requirements: 4.1, 4.2, 8.1, 8.2_

  - [ ]* 8.2 Write property test — Design topic reveal follows standard reveal-first pattern (Property 12)
    - **Property 12: Design topic reveal follows standard reveal-first pattern**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 9. Implement `QuestionReveal` component
  - Create `src/components/QuestionReveal.tsx` accepting `{ topic: HLDTopicContent | DeepDiveTopicContent; topicType: 'highLevelDesign' | 'deepDive'; revealedQuestions: Set<number>; onRevealQuestion: (index: number) => void }` props
  - For HLD: render each `HLDQuestion` as a separate item with its own "Reveal" button; when revealed, render all its `Approach` objects using `ApproachCard`; render the `systemArchitecture` table as the final question item (index = `questions.length`)
  - For Deep Dive: render each `DeepDiveQuestion` as a separate item with its own "Reveal" button; when revealed, render the single content block
  - Unrevealed questions show only their title/prompt and a "Reveal" button; subsequent questions remain hidden until the preceding one is revealed (or allow any order — match design intent)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 9.1 Write unit tests for `QuestionReveal`
    - HLD: renders each sub-topic with all approaches when revealed; `[RECOMMENDED]` approach has badge; non-recommended do not
    - HLD: renders System Architecture table as the final question item
    - Deep Dive: renders each numbered sub-section as a single content block when revealed
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 9.2 Write property test — HLD sub-topic reveal shows all approaches (Property 13)
    - **Property 13: HLD sub-topic reveal shows all approaches**
    - **Validates: Requirements 5.2**

  - [ ]* 9.3 Write property test — HLD question count includes System Architecture table (Property 14)
    - **Property 14: HLD question count includes System Architecture table**
    - **Validates: Requirements 5.3, 5.6**

  - [ ]* 9.4 Write property test — Next button gated on full question reveal (Property 6)
    - **Property 6: Next button gated on full question reveal**
    - **Validates: Requirements 5.6**

- [ ] 10. Checkpoint — Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement `DesignCard` component
  - Create `src/components/DesignCard.tsx` accepting `{ design: DesignSummary; progress: AttemptProgress | null; onStart: () => void; onContinue: () => void; onStartOver: () => void }` props
  - When `progress` is null: render only a "Start" button
  - When `progress` is present: render "Continue" and "Start Over" buttons (no "Start" button)
  - Display the design name prominently
  - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 11.1 Write unit tests for `DesignCard`
    - Renders design name
    - Shows only "Start" when progress is null
    - Shows "Continue" and "Start Over" (not "Start") when progress is present
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 11.2 Write property test — Design card renders its name (Property 1)
    - **Property 1: Design card renders its name**
    - **Validates: Requirements 1.2**

  - [ ]* 11.3 Write property test — Card button state reflects progress (Property 2)
    - **Property 2: Card button state reflects progress**
    - **Validates: Requirements 1.3, 1.4**

- [x] 12. Implement `LibraryPage`
  - Create `src/pages/LibraryPage.tsx`
  - On mount: dispatch `fetchIndex()` thunk; dispatch `hydrateProgress(loadAllProgressFromStorage())`
  - Select `contentSlice.index` and `progressSlice.records` via `useAppSelector`
  - Render a responsive CSS grid of `DesignCard` components (adjusts column count by viewport width)
  - Wire `onStart` / `onContinue` to `navigate('/attempt/:designId')`
  - Wire `onStartOver` to dispatch `clearProgress(designId)` then navigate to a fresh attempt
  - Show an empty-state message with extraction instructions when `index` is null or empty
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.1, 9.5_

- [x] 13. Implement `AttemptPage`
  - Create `src/pages/AttemptPage.tsx`
  - Read `designId` from `useParams()`
  - On mount: dispatch `fetchDesignContent(designId)` and `initAttempt(designId)`
  - Select `content`, `loading`, `error` via `useDesignContent(designId)`
  - Select `currentStep`, `revealedTopics`, `revealedQuestions`, `completed` from `attemptSlice`
  - Render design name as page heading at all times
  - Render `ProgressBar` with `current={currentStep - 1}` and `total={8}` when on a topic step
  - Step 0 (overview): render `overview` text and a "Begin" button that dispatches `navigateTo(1)`
  - Steps 1–8 (topics): render `TopicView` for standard topics; render `QuestionReveal` for HLD (step 5) and Deep Dive (step 6)
  - "Next" button: disabled for HLD/Deep Dive until all questions revealed; dispatches `navigateTo(currentStep + 1)`
  - "Back" button: visible when `currentStep > 0`; dispatches `navigateTo(currentStep - 1)`
  - "Finish" button on last topic: dispatches `markComplete()` then navigates to `/`
  - On fetch error: render error message with link back to library
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1–5.7, 8.1–8.4_

  - [ ]* 13.1 Write unit tests for `AttemptPage`
    - Renders design name as heading
    - Renders topics in the correct fixed order as `currentStep` advances
    - Shows "Back" button on steps > 0; hides it on step 0
    - Shows "Finish" on last topic; shows "Next" on all others
    - _Requirements: 2.3, 3.1, 3.3, 3.4, 3.5_

  - [ ]* 13.2 Write property test — Design heading invariant (Property 10)
    - **Property 10: Design heading invariant**
    - **Validates: Requirements 2.3**

  - [ ]* 13.3 Write property test — Back button presence (Property 8)
    - **Property 8: Back button presence**
    - **Validates: Requirements 3.5**

- [x] 14. Wire up routing and app entry point
  - Create `src/App.tsx` with `<BrowserRouter>`, `<Provider store={store}>`, and two `<Route>` entries: `/` → `LibraryPage`, `/attempt/:designId` → `AttemptPage`
  - Update `src/main.tsx`: call `loadAllProgressFromStorage()`, dispatch `hydrateProgress(records)` to the store, then render `<App />`
  - _Requirements: 1.5, 2.1_

- [ ] 15. Checkpoint — Ensure all page and routing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement PDF extraction script
  - [x] 16.1 Create `extract_pdfs.py` at workspace root
    - Accept `--pdf-dir` and `--output-dir` CLI arguments
    - Discover all `*.pdf` files in `--pdf-dir`; derive `id` (kebab-case) and `name` (spaced display name) from each filename with special-case handling for known compound names (`FBNewsFeed`, `Lyft_DriverLocation`, etc.)
    - For each PDF: extract full text with `pypdf`; split on section heading boundaries to isolate all 8 sections
    - Implement `extract_standard_section(text, heading) -> str` for plain-text sections
    - Implement `extract_hld_section(text) -> HLDTopicContent` with sub-topic detection, approach detection (title + description + trade-off), `[RECOMMENDED]` flag stripping, and System Architecture table parsing
    - Implement `extract_deep_dive_section(text) -> DeepDiveTopicContent` splitting on `^\d+\.\s+\w` pattern
    - Implement `extract_design_section(text, design_name) -> DesignTopicContent` matching `r'.+\s+—\s+System Design'`, splitting on `"Key Flows"`, parsing circled-numeral or `\d+\.` key flow items
    - Wrap each section extraction in try/except; log warnings; fall back to empty string/array on failure
    - Write `app/public/data/<id>.json` per design; write `app/public/data/index.json` after all PDFs
    - Exit non-zero only if zero JSON files were written or output directory is not writable
    - _Requirements: 6.1–6.12_

  - [ ]* 16.2 Write unit tests for PDF extractor
    - Known synthetic PDF text produces expected section keys including `design.diagram` and `design.keyFlows`
    - HLD parsing produces correct `HLDQuestion` array; `isRecommended` true only for `[RECOMMENDED]`-tagged approach; `systemArchitecture` contains parsed table
    - PDF with missing Design section produces `{ diagram: "", keyFlows: [] }` (no exception)
    - PDF with missing/unparseable HLD produces `{ questions: [], systemArchitecture: { components: [] } }` (no exception)
    - _Requirements: 6.7, 6.8, 6.10, 6.11_

  - [ ]* 16.3 Write property test — PDF extraction graceful degradation (Property 9)
    - **Property 9: PDF extraction graceful degradation**
    - **Validates: Requirements 6.11**

  - [ ]* 16.4 Write property test — HLD extractor isRecommended flag accuracy (Property 15)
    - **Property 15: HLD extractor isRecommended flag accuracy**
    - **Validates: Requirements 6.7**

  - [ ]* 16.5 Write property test — Deep Dive extractor produces one question per numbered sub-section (Property 16)
    - **Property 16: Deep Dive extractor produces one question per numbered sub-section**
    - **Validates: Requirements 6.8**

- [ ] 17. Integration tests
  - [ ]* 17.1 Write integration test — Full attempt flow
    - Start attempt → reveal all topics (including all HLD and Deep Dive questions) → click Finish → assert `progressSlice` has `completed: true` → assert localStorage contains serialized completed progress
    - _Requirements: 4.3, 5.6, 7.1, 7.2_

  - [ ]* 17.2 Write integration test — Start Over flow
    - Save progress → dispatch `clearProgress` → assert `progressSlice` record removed → assert localStorage key removed → assert fresh `attemptSlice` state on re-init
    - _Requirements: 1.6, 7.4_

  - [ ]* 17.3 Write integration test — PDF extractor end-to-end
    - Run extractor against one real PDF → verify output JSON has all expected keys and non-empty content for present sections
    - _Requirements: 6.1–6.10_

- [ ] 18. Accessibility and responsive layout polish
  - Audit all interactive elements for visible focus indicators (`outline` or equivalent)
  - Ensure semantic HTML throughout: headings hierarchy, `<button>` for actions, `<nav>` for progress, `<ul>`/`<li>` for lists
  - Verify responsive grid in `LibraryPage` renders correctly at 320 px, 768 px, and 1920 px breakpoints (use CSS Grid `auto-fill` / `minmax`)
  - Ensure no layout shifts on content reveal (use `min-height` or CSS transitions)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 19. Final checkpoint — Ensure all tests pass
  - Run `npm test` in `app/`; ensure all unit, property, and integration tests pass
  - Verify `npm run build` completes without errors (triggers `prebuild` → `extract_pdfs.py` → Vite build)
  - Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- Property tests (Properties 1–16) validate universal correctness guarantees; unit tests validate specific examples and edge cases
- The `prebuild` npm hook ensures JSON files are always regenerated before a production build; during development run `npm run extract` manually when PDFs change
- The Python extractor and the TypeScript app share the same JSON schema — `src/types/design.ts` is the single source of truth for that contract
