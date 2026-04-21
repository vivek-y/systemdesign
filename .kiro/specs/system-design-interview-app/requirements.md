# Requirements Document

## Introduction

A React application for practicing system design interviews. The app presents a library of 32 system design topics (sourced from PDF files in the workspace) and guides users through each topic section by section — encouraging active recall by hiding answers behind a reveal button. Progress is persisted locally so users can resume where they left off.

PDF content is extracted at build time by a Python script that reads each PDF and writes structured JSON files consumed by the React app at runtime. No PDF parsing occurs in the browser.

## Glossary

- **App**: The React single-page application being built.
- **Design**: A single system design topic (e.g., YouTube, Dropbox) sourced from one PDF file.
- **Attempt**: A user's active or saved session working through a Design.
- **Topic**: One of the eight sequential sections within a Design: Functional Requirements, Non-Functional Requirements, Core Entities, API Design, High Level Design, Deep Dive, Design (architecture diagram + key flows), What to Study Further.
- **Question**: An individual reveal-able item within the High Level Design or Deep Dive topics. For High Level Design, each sub-topic (e.g., "File Upload Strategy") is one Question; when revealed it shows all approaches (bad, better, best) for that sub-topic together, plus the System Architecture table is a final separate Question. For Deep Dive, each numbered sub-section is one Question (single content block).
- **Progress**: The saved state of an Attempt, including which Topics have been revealed and which Questions within High Level Design and Deep Dive have been revealed.
- **PDF_Extractor**: The build-time Python script responsible for extracting structured content from PDF files and writing JSON output files.
- **JSON_Content**: The static JSON files produced by the PDF_Extractor and consumed by the App at runtime.
- **Progress_Store**: The module responsible for persisting and retrieving Attempt progress using browser localStorage.
- **Design_Library**: The first page of the App showing all available Designs.
- **Attempt_View**: The page showing the active Attempt for a selected Design.

---

## Requirements

### Requirement 1: Design Library Page

**User Story:** As an interview candidate, I want to see all available system design topics on a single page, so that I can choose which design to practice.

#### Acceptance Criteria

1. THE App SHALL display a Design_Library page as the default route that lists all 32 Designs sourced from the PDF files in the workspace.
2. THE Design_Library SHALL display each Design as a card showing the design name derived from the PDF filename.
3. WHEN a user has no saved Progress for a Design, THE Design_Library SHALL display a "Start" button on that Design's card.
4. WHEN a user has saved Progress for a Design, THE Design_Library SHALL display both a "Continue" button and a "Start Over" button on that Design's card.
5. WHEN a user clicks "Start" or "Continue" on a Design card, THE App SHALL navigate to the Attempt_View for that Design.
6. WHEN a user clicks "Start Over" on a Design card, THE Progress_Store SHALL delete the existing Progress for that Design and THE App SHALL navigate to a fresh Attempt_View for that Design.

---

### Requirement 2: Attempt Overview

**User Story:** As an interview candidate, I want to see an overview of what I need to build before diving into topics, so that I can orient myself before starting.

#### Acceptance Criteria

1. WHEN an Attempt begins, THE Attempt_View SHALL display the Problem Overview section from the Design's PDF as the first screen before any Topic is shown.
2. THE Attempt_View SHALL display a "Begin" button that advances the user from the Problem Overview to the first Topic.
3. THE Attempt_View SHALL display the Design name as the page heading throughout the Attempt.

---

### Requirement 3: Sequential Topic Navigation

**User Story:** As an interview candidate, I want to work through topics in a fixed order, so that I follow the standard system design interview structure.

#### Acceptance Criteria

1. THE Attempt_View SHALL present Topics in the following fixed order: Functional Requirements, Non-Functional Requirements, Core Entities, API Design, High Level Design, Deep Dive, Design (architecture diagram + key flows), What to Study Further.
2. THE Attempt_View SHALL display a progress indicator showing the current Topic position out of the total number of Topics.
3. WHEN a user is on a Topic other than the last, THE Attempt_View SHALL display a "Next" button to advance to the following Topic.
4. WHEN a user is on the last Topic, THE Attempt_View SHALL display a "Finish" button that marks the Attempt as complete and returns the user to the Design_Library.
5. THE Attempt_View SHALL display a "Back" button on all Topics except the first, allowing the user to return to the previous Topic.

---

### Requirement 4: Reveal-First Topic Interaction

**User Story:** As an interview candidate, I want to think through each topic before seeing the answer, so that I can practice active recall rather than passive reading.

#### Acceptance Criteria

1. WHEN a Topic other than High Level Design, Deep Dive, or Design is displayed, THE Attempt_View SHALL show a prompt describing the topic and a "Reveal Answer" button, with the topic content hidden.
2. WHEN a user clicks "Reveal Answer" on a standard Topic, THE Attempt_View SHALL display the full content for that Topic.
3. WHEN a Topic's content has been revealed, THE Attempt_View SHALL NOT hide it again if the user navigates away and returns to that Topic within the same Attempt.
4. THE Progress_Store SHALL persist the revealed state of each Topic so that revealed content remains visible after a page refresh.

---

### Requirement 5: Question-by-Question Reveal for High Level Design and Deep Dive

**User Story:** As an interview candidate, I want High Level Design and Deep Dive sections to reveal one question at a time, so that I can think through each sub-problem individually.

#### Acceptance Criteria

1. WHEN the High Level Design Topic is displayed, THE Attempt_View SHALL present each HLD sub-topic (e.g., "File Upload Strategy", "Sync Mechanism") as a separate Question with its own "Reveal" button — one Question per sub-topic.
2. WHEN an HLD sub-topic Question is revealed, THE Attempt_View SHALL display all approaches for that sub-topic together (bad, better, and best), with the `[RECOMMENDED]` approach visually highlighted (e.g., green border and "Recommended" badge) and the other approaches shown in a neutral or warning style.
3. WHEN the High Level Design Topic is displayed, THE Attempt_View SHALL present the System Architecture table (listing components and their responsibilities) as a separate final Question after all sub-topic Questions, with its own "Reveal" button.
4. WHEN the Deep Dive Topic is displayed, THE Attempt_View SHALL present each numbered sub-section as a separate Question with its own "Reveal" button (one Question per numbered sub-section, single content block per question — no bad/good/best progression).
5. WHEN a user clicks "Reveal" on a Question, THE Attempt_View SHALL display only that Question's content, leaving subsequent Questions hidden.
6. WHEN all Questions in a Topic have been revealed, THE Attempt_View SHALL enable the "Next" button to advance to the following Topic.
7. THE Progress_Store SHALL persist the revealed state of each individual Question so that revealed Questions remain visible after a page refresh.

---

### Requirement 6: Build-Time PDF Content Extraction

**User Story:** As a developer, I want a build-time script to extract structured content from the PDF files into JSON, so that the React app can consume static data without any runtime PDF parsing.

#### Acceptance Criteria

1. THE PDF_Extractor SHALL be a Python script that runs at build time (not in the browser) and writes one JSON file per Design.
2. THE PDF_Extractor SHALL extract the Problem Overview text from each PDF and include it in the JSON output.
3. THE PDF_Extractor SHALL extract the Functional Requirements section from each PDF and include it in the JSON output.
4. THE PDF_Extractor SHALL extract the Non-Functional Requirements section from each PDF and include it in the JSON output.
5. THE PDF_Extractor SHALL extract the Core Entities section from each PDF and include it in the JSON output.
6. THE PDF_Extractor SHALL extract the API Design section from each PDF and include it in the JSON output.
7. THE PDF_Extractor SHALL extract the High Level Design section from each PDF and parse it into HLD sub-topics, where each sub-topic contains 2–3 progressively better approaches (bad → better → best); the extractor SHALL identify the `[RECOMMENDED]` approach by its title tag, extract each approach's title, description, and trade-off line, and also parse the System Architecture table at the end of the HLD section into component/responsibility pairs; all of this SHALL be included in the JSON output.
8. THE PDF_Extractor SHALL extract the Deep Dive section from each PDF and split it into individual Questions, one per numbered sub-section (each with a single content block — no bad/good/best progression), and include them in the JSON output.
9. THE PDF_Extractor SHALL extract the "What to Study Further" section from each PDF and include it in the JSON output.
10. THE PDF_Extractor SHALL extract the Design section from each PDF (the text-based architecture diagram and numbered key flows that appear after the "What to Study Further" section) and include it in the JSON output, split into a `diagram` string and a `keyFlows` array.
11. IF a PDF section cannot be parsed, THEN THE PDF_Extractor SHALL write an empty string or empty array for that section in the JSON output rather than failing the entire extraction.
12. THE App SHALL read Design content exclusively from the JSON_Content files produced by the PDF_Extractor and SHALL NOT perform any PDF parsing at runtime.

---

### Requirement 7: Progress Persistence

**User Story:** As an interview candidate, I want my progress saved automatically, so that I can close the browser and resume later without losing my place.

#### Acceptance Criteria

1. THE Progress_Store SHALL save Attempt progress to browser localStorage after every reveal action.
2. THE Progress_Store SHALL save Attempt progress after every Topic navigation action.
3. WHEN the App loads, THE Progress_Store SHALL restore all saved Attempt progress from localStorage.
4. WHEN a user clicks "Start Over" on a Design, THE Progress_Store SHALL remove all saved Progress for that Design from localStorage.
5. THE Progress_Store SHALL store progress keyed by Design name so that progress for different Designs does not interfere with each other.

---

### Requirement 8: Design Topic — Architecture Diagram

**User Story:** As an interview candidate, I want to see the system architecture diagram and key data flows for each design, so that I can verify my understanding of the overall system structure after working through the other topics.

#### Acceptance Criteria

1. WHEN the Design Topic is displayed, THE Attempt_View SHALL show a "Reveal Answer" call-to-action with the architecture diagram and key flows hidden, following the same reveal-first pattern as other standard Topics.
2. WHEN a user clicks "Reveal Answer" on the Design Topic, THE Attempt_View SHALL display the full text-based architecture diagram followed by the numbered key flows.
3. WHEN the Design Topic's content has been revealed, THE Attempt_View SHALL NOT hide it again if the user navigates away and returns to that Topic within the same Attempt.
4. THE Progress_Store SHALL persist the revealed state of the Design Topic so that the diagram and key flows remain visible after a page refresh.

---

### Requirement 9: Responsive and Accessible UI

**User Story:** As an interview candidate, I want the app to be usable on both desktop and mobile, so that I can practice anywhere.

#### Acceptance Criteria

1. THE App SHALL render correctly on viewport widths from 320px to 1920px without horizontal scrolling.
2. THE App SHALL use semantic HTML elements (headings, buttons, lists) so that screen readers can navigate the content.
3. THE App SHALL provide visible focus indicators on all interactive elements.
4. WHEN content is being revealed, THE App SHALL not cause layout shifts that disorient the user.
5. THE Design_Library SHALL display Design cards in a responsive grid that adjusts column count based on available viewport width.
