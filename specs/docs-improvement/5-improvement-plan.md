# Documentation Improvement Plan

**Generated:** 2025-12-18  
**Based On:** Documentation Audit v1.0, Documentation Standards v1.0  
**Purpose:** Prioritized plan for improving codebase documentation

## Executive Summary

### Current State
- **Total Gaps Identified:** 38 distinct documentation gaps
- **Critical (P0):** 12 gaps - Core algorithm, public APIs, architectural components
- **High Priority (P1):** 18 gaps - Important classes, integration points, complex logic
- **Medium Priority (P2):** 6 gaps - Supporting functions, utilities
- **Low Priority (P3):** 2 gaps - Simple helpers, optional enhancements

### Total Estimated Effort
- **Critical (P0):** 5.5 hours
- **High Priority (P1):** 7.0 hours
- **Medium Priority (P2):** 2.5 hours
- **Low Priority (P3):** 0.5 hours
- **External Documentation:** 3.0 hours
- **Total:** 18.5 hours

### Recommended Approach

Start with the critical P0 tasks that provide maximum value for both users and developers. These focus on the SuperMemo 2.0 algorithm, context filtering logic, and foundational architectural decisions. The queue-based frontmatter system is a critical design pattern that prevents data corruption, so documenting it thoroughly is essential.

After P0 completion, move to P1 tasks focusing on public APIs and Obsidian integration patterns. This will help contributors understand how to work with the Obsidian API correctly. Finally, address P2 and P3 tasks, and update external documentation to reflect the improved internal documentation.

## Priority Levels Definition

### P0 - Critical (Must Do)
User-facing features, complex algorithms, core plugin functionality, architectural decisions that prevent bugs

**Criteria:**
- Directly affects user experience
- Complex algorithm requiring mathematical explanation
- Core architectural pattern preventing data corruption
- Integration point that could cause bugs if misunderstood

### P1 - High (Should Do)
Important public APIs, integration points, class documentation, complex business logic

**Criteria:**
- Public API used by multiple parts of codebase
- Integration pattern with Obsidian API
- Complex business logic with edge cases
- Important for contributors to understand

### P2 - Medium (Nice to Have)
Supporting functions, utilities, standard patterns, UI components

**Criteria:**
- Supporting functionality
- Helper methods with some complexity
- UI patterns worth documenting
- Moderate contribution barriers

### P3 - Low (Eventually)
Simple helpers, well-understood code, optional enhancements

**Criteria:**
- Simple, self-explanatory code
- Low complexity
- Minimal contribution barriers
- Nice-to-have clarifications

## Improvement Tasks by File

### types.ts

**Path:** `src/types.ts`  
**Current Coverage:** 5% comments  
**Overall Priority:** P1 (High)

#### Tasks

1. **Add File Header**
   - **Priority:** P1
   - **Effort:** S (10 min)
   - **Description:** Create file header explaining centralized type definitions and architectural role
   - **Specific Needs:**
     - Explain purpose as domain model definitions
     - Note that this file has no runtime code
     - List key interfaces and their relationships
   - **Standard Reference:** File Header Template in Standards doc

2. **Document Context Interface**
   - **Priority:** P1
   - **Effort:** S (10 min)
   - **Description:** Add interface documentation explaining context system
   - **Specific Needs:**
     - Explain what contexts are and why they exist
     - Document each property with domain meaning
     - Note relationship to note categorization
   - **Standard Reference:** Interface Documentation Format

3. **Document ReviewOption Interface**
   - **Priority:** P1
   - **Effort:** S (10 min)
   - **Description:** Add interface documentation for review options
   - **Specific Needs:**
     - Explain score range (0-5 for SuperMemo 2.0)
     - Document how scores affect intervals
     - Provide example values
   - **Standard Reference:** Interface Documentation Format

4. **Document SpacingMethod Interface**
   - **Priority:** P1
   - **Effort:** M (20 min)
   - **Description:** Comprehensive documentation of complex interface
   - **Specific Needs:**
     - Explain algorithm selection mechanism
     - Document why defaultEaseFactor is optional
     - Explain conditional fields based on algorithm
     - Note extensibility for future algorithms
   - **Standard Reference:** Complex Interface Template

**File Total Effort:** 50 minutes (0.83 hours)

---

### suggester.ts

**Path:** `src/suggester.ts`  
**Current Coverage:** 0% comments  
**Overall Priority:** P2 (Medium)

#### Tasks

1. **Add File Header**
   - **Priority:** P2
   - **Effort:** S (10 min)
   - **Description:** Explain reusable modal UI component
   - **Specific Needs:**
     - Explain purpose as reusable selection UI
     - Note Obsidian SuggestModal integration
     - List key exports and usage pattern
   - **Standard Reference:** File Header Template (UI Component variant)

2. **Document Suggester Class**
   - **Priority:** P2
   - **Effort:** M (20 min)
   - **Description:** Document modal class and lifecycle
   - **Specific Needs:**
     - Explain constructor parameters
     - Document modal lifecycle (open, filter, select, close)
     - Note keyboard shortcut handling (Esc)
   - **Standard Reference:** Class Documentation Format

3. **Document suggester() Helper Function**
   - **Priority:** P2
   - **Effort:** M (20 min)
   - **Description:** Document promise-based wrapper pattern
   - **Specific Needs:**
     - Explain async/await convenience
     - Document return value (selected string or null)
     - Provide usage example
   - **Standard Reference:** Function Template with example

**File Total Effort:** 50 minutes (0.83 hours)

---

### frontmatterQueue.ts

**Path:** `src/frontmatterQueue.ts`  
**Current Coverage:** 0% comments  
**Overall Priority:** P0 (Critical)

#### Tasks

1. **Add File Header**
   - **Priority:** P0
   - **Effort:** M (20 min)
   - **Description:** Critical architectural documentation
   - **Specific Needs:**
     - Explain race condition problem this solves
     - Document Obsidian's multiple save events
     - Explain batching and deduplication approach
     - Note importance for data integrity
   - **Standard Reference:** File Header Template with emphasis on architecture

2. **Document FrontmatterQueue Class**
   - **Priority:** P0
   - **Effort:** M (25 min)
   - **Description:** Document core architectural pattern
   - **Specific Needs:**
     - Explain queue pattern and why it exists
     - Document deduplication via Object.assign
     - Provide usage example with add() + process()
   - **Standard Reference:** Well-Documented Integration Pattern example from Standards

3. **Document add() Method**
   - **Priority:** P0
   - **Effort:** M (20 min)
   - **Description:** Document queue behavior and edge cases
   - **Specific Needs:**
     - Explain deduplication (later updates override)
     - Document undefined = delete pattern
     - Provide examples
   - **Standard Reference:** Integration Method example

4. **Document process() Method**
   - **Priority:** P0
   - **Effort:** M (20 min)
   - **Description:** Document atomic processing guarantee
   - **Specific Needs:**
     - Explain atomic application of updates
     - Note queue clearing behavior
     - Document Promise.all pattern
   - **Standard Reference:** Method Documentation Format

5. **Add Inline Comments to Merge Logic**
   - **Priority:** P0
   - **Effort:** S (10 min)
   - **Lines:** 13-17
   - **Description:** Explain Object.assign deduplication
   - **Specific Needs:**
     - Explain merge behavior
     - Note that later values overwrite earlier
     - Document why this prevents conflicts
   - **Standard Reference:** Inline Comment Standards

**File Total Effort:** 1.58 hours

---

### logger.ts

**Path:** `src/logger.ts`  
**Current Coverage:** 1% comments  
**Overall Priority:** P1 (High)

#### Tasks

1. **Add File Header**
   - **Priority:** P1
   - **Effort:** S (15 min)
   - **Description:** Explain JSONL logging service
   - **Specific Needs:**
     - Explain privacy-conscious logging approach
     - Document JSONL format choice
     - Note configurability via settings
   - **Standard Reference:** File Header Template

2. **Document Logger Class**
   - **Priority:** P1
   - **Effort:** M (20 min)
   - **Description:** Document logging service architecture
   - **Specific Needs:**
     - Explain purpose and responsibilities
     - Document privacy controls
     - Note graceful error handling approach
   - **Standard Reference:** Class Documentation Format

3. **Document log() Method**
   - **Priority:** P1
   - **Effort:** M (25 min)
   - **Description:** Document main logging entry point
   - **Specific Needs:**
     - Explain all parameters
     - Document conditional logging (based on settings)
     - Note side effects (file I/O)
   - **Standard Reference:** Method Documentation Format

4. **Document generateLogData() Method**
   - **Priority:** P2
   - **Effort:** M (20 min)
   - **Description:** Document configurable log format
   - **Specific Needs:**
     - Explain conditional property inclusion
     - Document wildcard (*) behavior
     - Note privacy implications
   - **Standard Reference:** Method Documentation Format

5. **Add Inline Comments to Conditional Logic**
   - **Priority:** P1
   - **Effort:** S (15 min)
   - **Lines:** 25-40
   - **Description:** Explain settings-driven privacy controls
   - **Specific Needs:**
     - Explain wildcard vs. specific properties
     - Note privacy-first design
     - Document empty array behavior
   - **Standard Reference:** Edge Case Handling example

**File Total Effort:** 1.58 hours

---

### settings.ts

**Path:** `src/settings.ts`  
**Current Coverage:** 5% comments  
**Overall Priority:** P1 (High)

#### Tasks

1. **Add File Header**
   - **Priority:** P1
   - **Effort:** S (15 min)
   - **Description:** Explain settings UI and configuration management
   - **Specific Needs:**
     - Document role as settings orchestrator
     - Note UI rendering approach
     - List key exports
   - **Standard Reference:** File Header Template

2. **Document SpacedEverythingPluginSettings Interface**
   - **Priority:** P1
   - **Effort:** L (45 min)
   - **Description:** Comprehensive documentation of all 13+ settings
   - **Specific Needs:**
     - Document each property with purpose and constraints
     - Group into logical sections
     - Note default values where relevant
   - **Standard Reference:** Settings Interface example from Standards

3. **Document SpacedEverythingSettingTab Class**
   - **Priority:** P1
   - **Effort:** M (20 min)
   - **Description:** Document settings tab class
   - **Specific Needs:**
     - Explain purpose and lifecycle
     - Note Obsidian PluginSettingTab integration
   - **Standard Reference:** Class Documentation Format

4. **Document display() Method Overview**
   - **Priority:** P2
   - **Effort:** M (30 min)
   - **Description:** Add overview comment for 650-line method
   - **Specific Needs:**
     - Break down into logical sections
     - Explain dynamic visibility patterns
     - Document nested settings structure
     - Note that detailed docs are in subsection comments
   - **Standard Reference:** Method Documentation Format

5. **Add Section Headers with Inline Comments**
   - **Priority:** P1
   - **Effort:** M (30 min)
   - **Lines:** Throughout display() method
   - **Description:** Add comments dividing method into sections
   - **Specific Needs:**
     - Mark major sections (Spacing Methods, Contexts, Logging, etc.)
     - Add brief explanations for complex UI patterns
     - Note conditional visibility logic
   - **Standard Reference:** Inline Comment Standards

6. **Document isFileExcluded() Method**
   - **Priority:** P2
   - **Effort:** M (20 min)
   - **Description:** Document folder exclusion logic
   - **Specific Needs:**
     - Explain parent folder traversal
     - Document termination conditions
     - Note edge cases
   - **Standard Reference:** Method Documentation Format

7. **Address TODO Comments**
   - **Priority:** P3
   - **Effort:** S (5 min)
   - **Lines:** ~130, ~450
   - **Description:** Expand TODOs with context and priority
   - **Specific Needs:**
     - Add context about why improvement needed
     - Add priority level
     - Consider adding issue references
   - **Standard Reference:** TODO/FIXME Format from Standards

**File Total Effort:** 2.75 hours

---

### main.ts

**Path:** `src/main.ts`  
**Current Coverage:** 6-8% comments  
**Overall Priority:** P0 (Critical)

#### Tasks

1. **Add File Header**
   - **Priority:** P0
   - **Effort:** M (20 min)
   - **Description:** Document main plugin orchestrator
   - **Specific Needs:**
     - Explain role as entry point and coordinator
     - List key responsibilities
     - Note main dependencies and integration points
   - **Standard Reference:** Example: Core Plugin Module from Standards

2. **Document SpacedEverythingPlugin Class**
   - **Priority:** P0
   - **Effort:** M (30 min)
   - **Description:** Comprehensive class documentation
   - **Specific Needs:**
     - Explain architecture and coordination role
     - Document lifecycle (onload, commands, unload)
     - Provide workflow overview
   - **Standard Reference:** Example: Plugin Class from Standards

3. **Document updateInterval() Method - CRITICAL**
   - **Priority:** P0
   - **Effort:** L (60 min)
   - **Description:** Fully document SuperMemo 2.0 implementation
   - **Specific Needs:**
     - Explain SuperMemo 2.0 algorithm at high level
     - Document mathematical formula with all constants
     - Explain score < 3 reset rule
     - Document ease factor adjustment formula
     - Provide multiple examples
     - Add references to SuperMemo 2.0 specification
   - **Standard Reference:** Example: Well-Documented Algorithm from Standards (this is the gold standard example)

4. **Document filterNotesByContext() Method - CRITICAL**
   - **Priority:** P0
   - **Effort:** M (40 min)
   - **Description:** Document complex filtering with 4 edge cases
   - **Specific Needs:**
     - Explain all 4 edge cases clearly
     - Document priority order
     - Explain OR logic for contexts
     - Note backward compatibility rationale
   - **Standard Reference:** Example: Complex Business Logic from Standards

5. **Document Command Handlers**
   - **Priority:** P1
   - **Effort:** L (60 min)
   - **Description:** Document 5 user-facing commands
   - **Specific Needs:**
     - logReviewOutcome() - Main review workflow
     - openNextReviewItem() - Queue calculation and sorting
     - toggleNoteContextsWrapper() - Context selection
     - captureThought() - Thought capture workflow
     - updateSpacingMethod() - Method change workflow
   - **Standard Reference:** Method Documentation Format

6. **Document onboardNoteToSpacedEverything() Method**
   - **Priority:** P1
   - **Effort:** M (30 min)
   - **Description:** Document critical onboarding workflow
   - **Specific Needs:**
     - Explain multi-step process
     - Document context and method selection
     - Note frontmatter properties added
   - **Standard Reference:** Method Documentation Format

7. **Document getActiveSpacingMethod() Method**
   - **Priority:** P1
   - **Effort:** M (30 min)
   - **Description:** Document method fallback logic
   - **Specific Needs:**
     - Explain cascading fallback order
     - Document context-based resolution
     - Note edge cases
   - **Standard Reference:** Method Documentation Format

8. **Document Timestamp Handling Methods**
   - **Priority:** P1
   - **Effort:** M (30 min)
   - **Description:** Document formatTimestamp() and parseTimestamp()
   - **Specific Needs:**
     - Explain UTC vs Local timezone handling
     - Document legacy format support in parsing
     - Note ISO 8601 format
   - **Standard Reference:** Method Documentation Format

9. **Document Template Processing Methods**
   - **Priority:** P2
   - **Effort:** M (25 min)
   - **Description:** Document processCapturedThoughtNewNoteContents() and related
   - **Specific Needs:**
     - Document available variables ({{unixtime}}, {{date}}, {{time}}, {{thought}})
     - Explain variable replacement approach
     - Provide examples
   - **Standard Reference:** Method Documentation Format

10. **Document Queue Usage Pattern**
    - **Priority:** P1
    - **Effort:** S (15 min)
    - **Lines:** Various locations using queueFrontmatterUpdate()
    - **Description:** Add inline comments explaining queue pattern
    - **Specific Needs:**
      - Explain why queue is used (race condition prevention)
      - Note add + process pattern
      - Reference frontmatterQueue.ts architecture
    - **Standard Reference:** Integration Pattern example

11. **Add Inline Comments to SuperMemo 2.0 Constants**
    - **Priority:** P0
    - **Effort:** S (15 min)
    - **Lines:** updateInterval() method
    - **Description:** Explain magic numbers in algorithm
    - **Specific Needs:**
      - Document 0.1, 0.08, 0.02 constants
      - Explain 1.3 minimum ease factor
      - Note empirical derivation by Piotr Woźniak
    - **Standard Reference:** Magic Numbers and Constants example

12. **Add Inline Comments to Context Filtering Edge Cases**
    - **Priority:** P0
    - **Effort:** M (20 min)
    - **Lines:** 330-370
    - **Description:** Explain each of 4 distinct cases
    - **Specific Needs:**
      - Case 1: No contexts defined
      - Case 2: All contexts inactive
      - Case 3: Note has no context property
      - Case 4: Note matches active context
    - **Standard Reference:** Edge Case Handling example

**File Total Effort:** 6.08 hours

---

## Implementation Batches

### Batch 1: Core Infrastructure (Priority: P0)
**Estimated Effort:** 3.5 hours

**Files:**
- `src/types.ts` - Type definitions foundation
- `src/frontmatterQueue.ts` - Critical architectural pattern

**Tasks:**
- [types.ts] Add file header (10 min)
- [types.ts] Document all interfaces (40 min)
- [frontmatterQueue.ts] Add file header (20 min)
- [frontmatterQueue.ts] Document class and methods (65 min)
- [frontmatterQueue.ts] Add inline comments to merge logic (10 min)

**Rationale:** These files form the foundation. Type definitions are needed to understand data structures throughout. The queue pattern is critical architecture preventing data corruption—must be documented first as it's referenced everywhere.

**Dependencies:** None (start here)

**Quick Win:** frontmatterQueue.ts header immediately clarifies the most important architectural decision in the codebase

---

### Batch 2: Core Algorithm (Priority: P0)
**Estimated Effort:** 2.0 hours

**Files:**
- `src/main.ts` - SuperMemo 2.0 and context filtering

**Tasks:**
- [main.ts] Add file header (20 min)
- [main.ts] Document class (30 min)
- [main.ts] Document updateInterval() with full algorithm explanation (60 min)
- [main.ts] Add inline comments to SuperMemo constants (15 min)
- [main.ts] Document filterNotesByContext() (40 min)
- [main.ts] Add inline comments to context edge cases (20 min)

**Rationale:** The SuperMemo 2.0 algorithm is the core value proposition. Without understanding it, nothing else makes sense. Context filtering is also critical and confusing with its 4 edge cases. These are the highest-value documentation tasks.

**Dependencies:** Batch 1 complete (references types and queue)

**Quick Win:** SuperMemo 2.0 documentation immediately answers the most common question: "How do intervals work?"

---

### Batch 3: Public APIs (Priority: P1)
**Estimated Effort:** 3.5 hours

**Files:**
- `src/main.ts` - Command handlers and key methods
- `src/logger.ts` - Logging service

**Tasks:**
- [main.ts] Document 5 command handlers (60 min)
- [main.ts] Document onboardNoteToSpacedEverything() (30 min)
- [main.ts] Document getActiveSpacingMethod() (30 min)
- [main.ts] Document timestamp handling methods (30 min)
- [main.ts] Add inline comments for queue usage pattern (15 min)
- [logger.ts] Add file header (15 min)
- [logger.ts] Document class and log() method (45 min)
- [logger.ts] Add inline comments to conditional logic (15 min)

**Rationale:** Command handlers are user-facing entry points. Logging is important for power users. These are the APIs developers interact with most. Timestamp handling is used throughout and has subtle timezone logic.

**Dependencies:** Batch 2 complete (commands use algorithm)

**Quick Win:** Command documentation helps contributors understand user workflows

---

### Batch 4: Settings and UI (Priority: P1-P2)
**Estimated Effort:** 3.5 hours

**Files:**
- `src/settings.ts` - Configuration and UI
- `src/suggester.ts` - UI component

**Tasks:**
- [settings.ts] Add file header (15 min)
- [settings.ts] Document settings interface (45 min)
- [settings.ts] Document class (20 min)
- [settings.ts] Add section headers in display() (30 min)
- [settings.ts] Document isFileExcluded() (20 min)
- [settings.ts] Expand TODOs (5 min)
- [suggester.ts] Add file header (10 min)
- [suggester.ts] Document class and function (40 min)

**Rationale:** Settings are complex but less critical than core algorithm. UI components are reusable patterns worth documenting but not blocking. Group together since both are UI-focused.

**Dependencies:** Batch 1 complete (uses types)

**Quick Win:** Settings interface documentation helps users understand configuration options

---

### Batch 5: Utilities and Polish (Priority: P2-P3)
**Estimated Effort:** 1.5 hours

**Files:**
- `src/main.ts` - Template processing and utilities
- `src/logger.ts` - Remaining methods

**Tasks:**
- [main.ts] Document template processing methods (25 min)
- [logger.ts] Document generateLogData() (20 min)
- [settings.ts] Document display() method overview (30 min)
- Review all TODO comments and expand as needed (15 min)

**Rationale:** These are nice-to-have improvements. Template processing is relatively straightforward. Utility methods have moderate complexity but low impact.

**Dependencies:** All previous batches complete

**Quick Win:** Template variables documentation helps users customize thought capture

---

### Batch 6: External Documentation (Priority: P1)
**Estimated Effort:** 3.0 hours

**Files:**
- `README.md` - Main project documentation
- `docs/Glossary.md` - Terminology reference
- `docs/` - Additional guides

**Tasks:**
- [README.md] Add "Installation" section (20 min)
- [README.md] Create "Getting Started" guide with examples (45 min)
- [README.md] Add "Configuration" section explaining all settings (40 min)
- [README.md] Document frontmatter properties (20 min)
- [README.md] Add SuperMemo 2.0 explanation for users (25 min)
- [README.md] Document template variables (15 min)
- [Glossary.md] Migrate glossary content from notes (30 min)
- [Glossary.md] Add SuperMemo 2.0 terminology (15 min)
- Review and polish external docs (30 min)

**Rationale:** External documentation supports users. Best done after internal documentation is complete so we can reference it accurately. Users need clear installation instructions and configuration guidance.

**Dependencies:** All code documentation complete (can reference internal docs)

**Quick Win:** Getting Started guide dramatically improves new user experience

---

## Detailed Task List

### Critical Tasks (P0) - Do First

- [x] **frontmatterQueue.ts: File header** - `frontmatterQueue.ts` - S - Explain race condition prevention architecture
- [x] **frontmatterQueue.ts: Class documentation** - `frontmatterQueue.ts` - M - Document queue pattern and deduplication
- [x] **frontmatterQueue.ts: add() method** - `frontmatterQueue.ts` - M - Document queue behavior and undefined=delete
- [x] **frontmatterQueue.ts: process() method** - `frontmatterQueue.ts` - M - Document atomic processing guarantee
- [x] **frontmatterQueue.ts: Inline comments** - `frontmatterQueue.ts` - S - Explain Object.assign merge logic
- [x] **main.ts: File header** - `main.ts` - M - Document main orchestrator role
- [x] **main.ts: Class documentation** - `main.ts` - M - Document plugin lifecycle and coordination
- [x] **main.ts: updateInterval() method** - `main.ts` - L - Full SuperMemo 2.0 algorithm documentation with formula
- [x] **main.ts: SuperMemo constants** - `main.ts` - S - Explain 0.1, 0.08, 0.02, 1.3 constants
- [x] **main.ts: filterNotesByContext()** - `main.ts` - M - Document 4 edge cases clearly
- [x] **main.ts: Context edge case comments** - `main.ts` - M - Inline comments for each filtering case
- [x] **types.ts: File header** - `types.ts` - S - Explain centralized type definitions

**Total P0 Effort:** 5.5 hours

### High Priority Tasks (P1) - Do Soon

- [x] **types.ts: Context interface** - `types.ts` - S - Document context system
- [x] **types.ts: ReviewOption interface** - `types.ts` - S - Document score range and effects
- [x] **types.ts: SpacingMethod interface** - `types.ts` - M - Document complex interface with conditionals
- [x] **main.ts: Command handlers** - `main.ts` - L - Document 5 user-facing commands
- [x] **main.ts: onboardNoteToSpacedEverything()** - `main.ts` - M - Document onboarding workflow
- [x] **main.ts: getActiveSpacingMethod()** - `main.ts` - M - Document method fallback logic
- [x] **main.ts: Timestamp methods** - `main.ts` - M - Document timezone handling
- [x] **main.ts: Queue pattern comments** - `main.ts` - S - Inline comments for queue usage
- [x] **logger.ts: File header** - `logger.ts` - S - Explain JSONL logging service
- [x] **logger.ts: Class documentation** - `logger.ts` - M - Document logging service architecture
- [x] **logger.ts: log() method** - `logger.ts` - M - Document main logging entry point
- [x] **logger.ts: Conditional logic comments** - `logger.ts` - S - Explain privacy controls
- [x] **settings.ts: File header** - `settings.ts` - S - Document settings UI role
- [x] **settings.ts: Settings interface** - `settings.ts` - L - Document all 13+ properties
- [x] **settings.ts: Class documentation** - `settings.ts` - M - Document settings tab
- [x] **settings.ts: Section headers** - `settings.ts` - M - Add comments dividing display() method
- [x] **settings.ts: isFileExcluded()** - `settings.ts` - M - Document folder traversal logic
- [x] **settings.ts: TODO expansion** - `settings.ts` - S - Expand TODOs with context
- [x] **suggester.ts: File header** - `suggester.ts` - S - Explain reusable modal component
- [x] **suggester.ts: Class documentation** - `suggester.ts` - M - Document modal class
- [x] **suggester.ts: suggester() function** - `suggester.ts` - M - Document promise wrapper
- [x] **README.md: Installation** - `README.md` - S - Add installation instructions
- [x] **README.md: Getting Started** - `README.md` - M - Create walkthrough with examples

**Total P1 Effort:** 7.0 hours

### Medium Priority Tasks (P2) - Do Eventually

- [x] **suggester.ts: File header** - `suggester.ts` - S - Explain reusable modal component
- [x] **suggester.ts: Class documentation** - `suggester.ts` - M - Document modal class
- [x] **suggester.ts: suggester() function** - `suggester.ts` - M - Document promise wrapper
- [x] **logger.ts: generateLogData()** - `logger.ts` - M - Document configurable log format
- [x] **settings.ts: display() overview** - `settings.ts` - M - Add method overview comment
- [x] **settings.ts: isFileExcluded()** - `settings.ts` - M - Document folder traversal logic
- [x] **main.ts: Template processing** - `main.ts` - M - Document variable replacement
- [x] **README.md: Configuration** - `README.md` - M - Explain all settings in detail
- [x] **README.md: Frontmatter properties** - `README.md` - S - Document se-* properties
- [x] **README.md: SuperMemo explanation** - `README.md` - M - User-friendly algorithm explanation
- [x] **README.md: Template variables** - `README.md` - S - Document {{}} variables
- [x] **Glossary.md: Migrate content** - `docs/Glossary.md` - M - Add all terminology definitions
- [x] **Glossary.md: SuperMemo terms** - `docs/Glossary.md` - S - Add algorithm terminology

**Total P2 Effort:** 2.5 hours

### Low Priority Tasks (P3) - Optional

- [ ] **settings.ts: TODO expansion** - `settings.ts` - S - Expand TODOs with context
- [ ] **General: TODO review** - Various - S - Review and standardize all TODOs

**Total P3 Effort:** 0.5 hours

## Dependency Graph

```
Batch 1: Core Infrastructure (types.ts, frontmatterQueue.ts)
  ↓
Batch 2: Core Algorithm (main.ts: SuperMemo & context filtering)
  ↓
Batch 3: Public APIs (main.ts commands, logger.ts)
  ↓
Batch 4: Settings and UI (settings.ts, suggester.ts)
  ↓
Batch 5: Utilities and Polish (remaining methods)
  ↓
Batch 6: External Documentation (README, docs/)
```

**Critical Dependencies:**
- `types.ts` must be documented before files using those types
- `frontmatterQueue.ts` architecture must be clear before documenting its usage
- `main.ts` SuperMemo algorithm must be documented before commands (they reference it)
- All internal docs should be complete before external docs (for consistency)

**Parallel Work Opportunities:**
- After Batch 1: `suggester.ts` could be done in parallel with Batch 2 (no dependencies)
- Batch 3 and Batch 4 could partially overlap (different files)
- External documentation (Batch 6) could start once P0 and P1 internal docs are done

## Success Metrics

### Quantitative Goals

- **Comment Coverage:** Increase from 2-3% to 20-25% (target: well-documented key sections, not 100%)
- **Public API Documentation:** Achieve 100% coverage (all public methods documented)
- **Critical Gaps:** Resolve all 12 P0 gaps
- **File Headers:** Add to 100% of source files (6/6 files)
- **Interface Documentation:** Document all 3 core interfaces completely

### Qualitative Goals

- New contributors can understand architecture from comments alone
- SuperMemo 2.0 algorithm is clear to developers without math background
- Context filtering edge cases are no longer source of confusion
- Obsidian integration patterns are documented for developers unfamiliar with platform
- Queue-based frontmatter pattern is understood as critical architectural decision
- External documentation is comprehensive enough for new users to get started

### Completion Criteria

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed  
- [ ] Documentation standards applied consistently
- [ ] External documentation updated (README, Glossary)
- [ ] Code review confirms documentation quality and accuracy

## Implementation Notes

### Quick Wins (Start Here)

These tasks have high impact and low effort:

1. **frontmatterQueue.ts file header** (20 min) - Immediately clarifies most important architectural decision
2. **types.ts interfaces** (40 min) - Small investment, used throughout codebase
3. **main.ts SuperMemo constants** (15 min) - Explains mysterious numbers with huge clarity impact
4. **README Installation section** (20 min) - Dramatically improves first-time user experience

### High-Effort Areas (Plan Carefully)

These tasks require significant time investment:

1. **main.ts updateInterval() documentation** (60 min) - Full algorithm explanation with examples
2. **main.ts command handlers** (60 min) - 5 different workflows to document
3. **settings.ts interface documentation** (45 min) - 13+ properties with contexts and constraints
4. **README Getting Started guide** (45 min) - Comprehensive walkthrough with examples

### Iterative Approach

1. **Complete one batch fully before moving to next**
   - Finish all tasks in Batch 1 before starting Batch 2
   - Allows for review and quality checks at batch boundaries
   - Prevents context switching between different areas

2. **Review quality after each batch**
   - Check that documentation follows standards
   - Verify technical accuracy
   - Ensure examples are correct and helpful
   - Get feedback from a fresh reader if possible

3. **Adjust standards or approach if needed**
   - If standards prove too verbose, simplify
   - If examples aren't helpful, revise format
   - If effort estimates are off, recalibrate for remaining batches

4. **Get feedback on early batches**
   - Share Batch 1-2 results with team or users
   - Identify what's working and what needs improvement
   - Apply learnings to remaining batches

### Documentation Quality Checks

Before considering a task complete, verify:

- [ ] **Technical accuracy** - Does documentation match implementation?
- [ ] **Completeness** - Are all important aspects covered?
- [ ] **Clarity** - Can someone unfamiliar with code understand it?
- [ ] **Examples** - Are examples correct and helpful?
- [ ] **Consistency** - Does it follow project standards?
- [ ] **No redundancy** - Is information duplicated unnecessarily?
- [ ] **Up to date** - Does it reflect current code state?

### Common Pitfalls to Avoid

**Pitfall 1: Documentation drift**
- **Risk:** Documentation becomes outdated as code changes
- **Prevention:** Update docs in same commit as code changes
- **Solution:** Include doc updates in implementation workflow

**Pitfall 2: Over-documentation**
- **Risk:** Documenting every obvious line clutters code
- **Prevention:** Follow "document WHY not WHAT" principle
- **Solution:** Focus on complex sections and design decisions

**Pitfall 3: Under-documenting integration points**
- **Risk:** Contributors misuse Obsidian APIs causing bugs
- **Prevention:** Always explain Obsidian-specific patterns
- **Solution:** Reference race conditions and caching behavior

**Pitfall 4: Generic copy-paste docs**
- **Risk:** Documentation says nothing meaningful
- **Prevention:** Customize every comment for its context
- **Solution:** Use templates as starting points, not final products

**Pitfall 5: Missing examples**
- **Risk:** Complex APIs remain confusing despite documentation
- **Prevention:** Add examples for non-obvious usage patterns
- **Solution:** Include examples in Standards doc as reference

### Tracking Progress

Use the task_progress checklists to track completion:

```markdown
Batch 1: Core Infrastructure
- [x] types.ts file header
- [x] types.ts interfaces
- [x] frontmatterQueue.ts file header
- [x] frontmatterQueue.ts class
- [x] frontmatterQueue.ts methods
- [x] frontmatterQueue.ts inline comments
```

Update after each work session to maintain momentum and clarity.

## Next Steps

### Immediate Actions

1. **Begin Batch 1** - Start with types.ts and frontmatterQueue.ts
2. **Set up documentation environment** - Ensure IDE is configured for JSDoc
3. **Review standards document** - Familiarize with templates and examples
4. **Plan first work session** - Block time for initial batch (3.5 hours)

### After Each Batch

1. **Self-review** - Check documentation quality against standards
2. **Test examples** - Verify code examples compile and run
3. **Update progress** - Mark completed tasks in this plan
4. **Commit changes** - Follow git standards from `.clinerules/git.md`
5. **Brief break** - Context switch to next batch when ready

### After All Batches Complete

1. **Comprehensive review** - Read through all documentation as if you're a new contributor
2. **Check consistency** - Ensure terminology is consistent across files
3. **Verify cross-references** - Check that internal references are accurate
4. **Update this plan** - Note actual time spent vs. estimates for future reference
5. **Celebrate completion** - Documentation is often thankless work—acknowledge the achievement

### Future Maintenance

Documentation is not a one-time effort. Establish practices for keeping it current:

1. **Include in code reviews** - Check that PRs update relevant documentation
2. **Regular audits** - Quarterly check for documentation drift
3. **User feedback** - Track questions that indicate documentation gaps
4. **Update on refactors** - Major refactors should trigger documentation review
5. **Version in README** - Note documentation last updated date in README

## References

- **Documentation Standards:** `specs/docs-improvement/4-documentation-standards.md`
- **Documentation Audit:** `specs/docs-improvement/3-documentation-audit.md`
- **Codebase Map:** `specs/docs-improvement/2-codebase-map.md`
- **Project Overview:** `specs/docs-improvement/1-project-overview.md`

## Appendix: Task Effort Breakdown

### By Priority Level

| Priority | Task Count | Total Effort | Avg per Task |
|----------|-----------|--------------|--------------|
| P0 | 12 | 5.5 hours | 27.5 min |
| P1 | 18 | 7.0 hours | 23.3 min |
| P2 | 13 | 2.5 hours | 11.5 min |
| P3 | 2 | 0.5 hours | 15.0 min |
| External | 8 | 3.0 hours | 22.5 min |
| **Total** | **53** | **18.5 hours** | **20.9 min** |

### By File

| File | Task Count | Total Effort | Priority Range |
|------|-----------|--------------|----------------|
| main.ts | 12 | 6.08 hours | P0-P2 |
| settings.ts | 7 | 2.75 hours | P1-P3 |
| logger.ts | 5 | 1.58 hours | P1-P2 |
| frontmatterQueue.ts | 5 | 1.58 hours | P0 |
| types.ts | 4 | 0.83 hours | P1 |
| suggester.ts | 3 | 0.83 hours | P2 |
| README.md | 6 | 2.42 hours | P1-P2 |
| Glossary.md | 2 | 0.75 hours | P2 |
| **Total** | **44** | **16.8 hours** | (excluding reviews) |

### By Batch

| Batch | Task Count | Total Effort | Dependencies |
|-------|-----------|--------------|--------------|
| Batch 1: Core Infrastructure | 6 | 3.5 hours | None |
| Batch 2: Core Algorithm | 6 | 2.0 hours | Batch 1 |
| Batch 3: Public APIs | 8 | 3.5 hours | Batch 2 |
| Batch 4: Settings and UI | 8 | 3.5 hours | Batch 1 |
| Batch 5: Utilities | 4 | 1.5 hours | All previous |
| Batch 6: External Docs | 8 | 3.0 hours | Code docs complete |
| **Total** | **40** | **17.0 hours** | Sequential |

**Note:** Some tasks appear in multiple categorizations. Total effort is 18.5 hours including buffer time for reviews and iterations.

---

*This improvement plan provides a structured, prioritized approach to systematically improving documentation quality across the Spaced Everything codebase. By following the batched approach and focusing on critical gaps first, we ensure maximum value delivery while maintaining momentum throughout the documentation project.*
