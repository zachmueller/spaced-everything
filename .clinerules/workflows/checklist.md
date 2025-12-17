# Checklist Workflow

Generate a custom checklist for the current feature based on user requirements.

## Description
This workflow creates quality validation checklists that serve as "unit tests for requirements writing." These checklists validate the quality, clarity, and completeness of requirements in specific domains rather than testing implementation.

## Core Concept: "Unit Tests for English"

**CRITICAL UNDERSTANDING:** Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements in a given domain.

**NOT for verification/testing:**
- ❌ NOT "Verify the button clicks correctly"
- ❌ NOT "Test error handling works"  
- ❌ NOT "Confirm the API returns 200"
- ❌ NOT checking if code/implementation matches the spec

**FOR requirements quality validation:**
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
- ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)
- ✅ "Does the spec define what happens when logo image fails to load?" (edge cases)

## Usage
Run this workflow to:
- Generate domain-specific quality checklists (UX, API, security, performance, etc.)
- Validate requirement completeness and clarity
- Ensure specifications are ready for implementation
- Create systematic quality gates for requirements review

## Workflow Steps

### Step 1: Setup and Context Loading
Load feature context and determine checklist scope:

**Commands to run:**
```bash
# Check current feature branch
git branch --show-current

# Verify feature directory exists  
ls specs/*/

# Load feature specification
cat specs/*/spec.md

# Check for existing checklists
ls specs/*/checklists/
```

Parse feature directory and specification content for context.

### Step 2: Clarify Checklist Intent
Derive up to THREE contextual clarifying questions based on user request and extracted signals:

**Question Generation Algorithm:**
1. **Extract Signals:** Feature domain keywords (auth, latency, UX, API), risk indicators ("critical", "must", "compliance"), stakeholder hints ("QA", "review", "security team"), explicit deliverables ("a11y", "rollback", "contracts")
2. **Cluster Signals:** Group into candidate focus areas (max 4) ranked by relevance
3. **Identify Audience & Timing:** Author, reviewer, QA, release gate
4. **Detect Missing Dimensions:** Scope breadth, depth/rigor, risk emphasis, exclusion boundaries, measurable acceptance criteria

**Question Archetypes:**
- **Scope Refinement:** "Should this include integration touchpoints with X and Y or stay limited to local module correctness?"
- **Risk Prioritization:** "Which of these potential risk areas should receive mandatory gating checks?"
- **Depth Calibration:** "Is this a lightweight pre-commit sanity list or a formal release gate?"
- **Audience Framing:** "Will this be used by the author only or peers during PR review?"
- **Boundary Exclusion:** "Should we explicitly exclude performance tuning items this round?"
- **Scenario Gap:** "No recovery flows detected—are rollback/partial failure paths in scope?"

**Defaults when interaction not possible:**
- **Depth:** Standard
- **Audience:** Reviewer (PR) if code-related; Author otherwise
- **Focus:** Top 2 relevance clusters

Skip questions individually if already unambiguous in user request. Present Q1/Q2/Q3 with compact option tables where appropriate.

### Step 3: Understand User Request
Combine user input with clarifying answers to determine:
- **Checklist Theme:** Security, UX, API, performance, etc.
- **Focus Areas:** Specific aspects to emphasize
- **Depth Level:** Lightweight vs. comprehensive validation
- **Target Audience:** Author, reviewer, QA team, release gate
- **Must-Have Items:** Explicitly mentioned requirements by user

### Step 4: Load Feature Context
Read relevant portions from feature specification:

**Context Loading Strategy:**
- Load only portions relevant to active focus areas (avoid full-file dumping)
- Summarize long sections into concise scenario/requirement bullets
- Use progressive disclosure - add follow-on retrieval only if gaps detected
- If source docs are large, generate interim summary items

**Key Elements to Extract:**
- **spec.md:** Feature requirements, user scenarios, success criteria, edge cases
- **plan.md (if exists):** Technical architecture, security requirements, integration points
- **data-model.md (if exists):** Entity relationships, validation rules

### Step 5: Generate Requirements Quality Checklist
Create systematic "unit tests for requirements" grouped by quality dimensions:

**Category Structure:**
- **Requirement Completeness** (Are all necessary requirements documented?)
- **Requirement Clarity** (Are requirements specific and unambiguous?)
- **Requirement Consistency** (Do requirements align without conflicts?)
- **Acceptance Criteria Quality** (Are success criteria measurable?)
- **Scenario Coverage** (Are all flows/cases addressed?)
- **Edge Case Coverage** (Are boundary conditions defined?)
- **Non-Functional Requirements** (Performance, Security, Accessibility specified?)
- **Dependencies & Assumptions** (Are they documented and validated?)
- **Ambiguities & Conflicts** (What needs clarification?)

**Checklist Generation Process:**
1. **Create Directory:** `specs/[feature]/checklists/` if it doesn't exist
2. **Generate Filename:** Use domain-based name (e.g., `ux.md`, `api.md`, `security.md`)
3. **Number Items:** Sequential numbering starting from CHK001
4. **Each Run Creates New File:** Never overwrite existing checklists

### Step 6: Write Effective Checklist Items
Each item must follow the "Unit Tests for English" pattern:

**✅ CORRECT Pattern - Testing Requirements Quality:**
```markdown
- [ ] CHK001 - Are the number and layout of featured episodes explicitly specified? [Completeness, Spec §FR-001]
- [ ] CHK002 - Are hover state requirements consistently defined for all interactive elements? [Consistency, Spec §FR-003]  
- [ ] CHK003 - Are navigation requirements clear for all clickable brand elements? [Clarity, Spec §FR-010]
- [ ] CHK004 - Is the selection criteria for related episodes documented? [Gap, Spec §FR-005]
- [ ] CHK005 - Are loading state requirements defined for asynchronous episode data? [Gap]
- [ ] CHK006 - Can "visual hierarchy" requirements be objectively measured? [Measurability, Spec §FR-001]
```

**❌ WRONG Pattern - Testing Implementation:**
```markdown  
- [ ] CHK001 - Verify landing page displays 3 episode cards [Spec §FR-001]
- [ ] CHK002 - Test hover states work correctly on desktop [Spec §FR-003]
- [ ] CHK003 - Confirm logo click navigates to home page [Spec §FR-010]
- [ ] CHK004 - Check that related episodes section shows 3-5 items [Spec §FR-005]
```

**Item Structure Requirements:**
- **Question Format:** Ask about requirement quality (not implementation behavior)
- **Quality Dimension:** Include in brackets [Completeness/Clarity/Consistency/etc.]
- **Traceability Reference:** Include spec section `[Spec §X.Y]` or gap marker `[Gap]`
- **Focus on Written Requirements:** What's documented (or missing) in the spec

**Quality Dimension Examples:**

**Completeness:**
- "Are error handling requirements defined for all API failure modes? [Gap]"
- "Are accessibility requirements specified for all interactive elements? [Completeness]"
- "Are mobile breakpoint requirements defined for responsive layouts? [Gap]"

**Clarity:**
- "Is 'fast loading' quantified with specific timing thresholds? [Clarity, Spec §NFR-2]"
- "Are 'related episodes' selection criteria explicitly defined? [Clarity, Spec §FR-5]"
- "Is 'prominent' defined with measurable visual properties? [Ambiguity, Spec §FR-4]"

**Consistency:**
- "Do navigation requirements align across all pages? [Consistency, Spec §FR-10]"
- "Are card component requirements consistent between landing and detail pages? [Consistency]"

**Coverage:**
- "Are requirements defined for zero-state scenarios (no episodes)? [Coverage, Edge Case]"
- "Are concurrent user interaction scenarios addressed? [Coverage, Gap]"
- "Are requirements specified for partial data loading failures? [Coverage, Exception Flow]"

**Measurability:**
- "Are visual hierarchy requirements measurable/testable? [Acceptance Criteria, Spec §FR-1]"
- "Can 'balanced visual weight' be objectively verified? [Measurability, Spec §FR-2]"

### Step 7: Traceability and Coverage Requirements
Ensure comprehensive requirement coverage:

**Traceability Standards:**
- **MINIMUM:** ≥80% of items MUST include traceability reference
- **Reference Types:** Spec section `[Spec §X.Y]`, gap markers `[Gap]`, issue types `[Ambiguity]`, `[Conflict]`, `[Assumption]`
- **ID System:** If no requirement ID scheme exists, include: "Is a requirement & acceptance criteria ID scheme established? [Traceability]"

**Scenario Coverage Validation:**
Check requirements exist for scenario classes:
- **Primary Scenarios:** Happy path user flows
- **Alternate Scenarios:** Alternative user paths and choices  
- **Exception/Error Scenarios:** Error conditions and failure modes
- **Recovery Scenarios:** Rollback and error recovery procedures
- **Non-Functional Scenarios:** Performance, security, accessibility

**Issue Detection:**
- **Ambiguities:** "Is the term 'fast' quantified with specific metrics? [Ambiguity, Spec §NFR-1]"
- **Conflicts:** "Do navigation requirements conflict between §FR-10 and §FR-10a? [Conflict]"
- **Assumptions:** "Is the assumption of 'always available podcast API' validated? [Assumption]"
- **Dependencies:** "Are external podcast API requirements documented? [Dependency, Gap]"

### Step 8: Checklist Structure and Format
Use canonical checklist template structure:

```markdown
# [Domain] Requirements Quality Checklist: [FEATURE NAME]

**Purpose:** Validate [domain] requirements completeness and quality before proceeding to implementation
**Created:** [DATE]
**Feature:** [Link to spec.md]
**Focus:** [Specific focus areas for this checklist]

## Requirement Completeness
- [ ] CHK001 - [Completeness check item] [Completeness, Spec §X.Y]
- [ ] CHK002 - [Another completeness item] [Gap]

## Requirement Clarity  
- [ ] CHK003 - [Clarity check item] [Clarity, Spec §X.Y]
- [ ] CHK004 - [Ambiguity resolution item] [Ambiguity, Spec §X.Y]

## Requirement Consistency
- [ ] CHK005 - [Consistency check item] [Consistency, Spec §X.Y]
- [ ] CHK006 - [Cross-reference validation] [Consistency]

## Acceptance Criteria Quality
- [ ] CHK007 - [Measurability check] [Measurability, Spec §X.Y]
- [ ] CHK008 - [Testability validation] [Acceptance Criteria, Spec §X.Y]

## Scenario Coverage
- [ ] CHK009 - [Primary scenario coverage] [Coverage, Spec §X.Y]
- [ ] CHK010 - [Edge case coverage] [Coverage, Gap]

## [Additional Domain-Specific Categories]
- [ ] CHK011 - [Domain-specific item] [Category, Reference]

## Notes
- Items marked incomplete require spec updates before proceeding to implementation
- Focus areas: [List the specific areas emphasized in this checklist]
- Coverage: [Summary of what scenarios/requirements are covered]
```

### Step 9: Content Consolidation and Quality Control
Optimize checklist content for effectiveness:

**Content Management:**
- **Soft Cap:** If raw candidate items > 40, prioritize by risk/impact
- **Merge Duplicates:** Combine near-duplicates checking same requirement aspect
- **Consolidate Edge Cases:** If >5 low-impact edge cases, create single item: "Are edge cases X, Y, Z addressed in requirements? [Coverage]"
- **Global ID Sequence:** Use incrementing CHK### IDs across all items

**🚫 ABSOLUTELY PROHIBITED Patterns:**
- ❌ Items starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
- ❌ References to code execution, user actions, system behavior  
- ❌ "Displays correctly", "works properly", "functions as expected"
- ❌ "Click", "navigate", "render", "load", "execute"
- ❌ Test cases, test plans, QA procedures
- ❌ Implementation details (frameworks, APIs, algorithms)

**✅ REQUIRED Patterns:**
- ✅ "Are [requirement type] defined/specified/documented for [scenario]?"
- ✅ "Is [vague term] quantified/clarified with specific criteria?"
- ✅ "Are requirements consistent between [section A] and [section B]?"
- ✅ "Can [requirement] be objectively measured/verified?"
- ✅ "Are [edge cases/scenarios] addressed in requirements?"
- ✅ "Does the spec define [missing aspect]?"

### Step 10: Finalize and Report
Complete checklist creation and provide summary:

**Commands to run:**
```bash
# Add new checklist file
git add specs/*/checklists/[domain].md

# Commit checklist
git commit -m "docs: add [domain] requirements quality checklist

- [number] validation items for [domain] requirements
- Focus areas: [list focus areas]  
- Coverage: [primary/alternate/exception/recovery scenarios]"
```

**Completion Report:**
- Full path to created checklist file
- Total item count and focus areas
- Coverage summary (what requirement areas are validated)
- Reminder that each run creates a new file
- Next steps for using the checklist

## Example Checklist Types

### UX Requirements Quality: `ux.md`
Sample items testing UX requirements (not implementation):
- "Are visual hierarchy requirements defined with measurable criteria? [Clarity, Spec §FR-1]"
- "Is the number and positioning of UI elements explicitly specified? [Completeness, Spec §FR-1]"
- "Are interaction state requirements (hover, focus, active) consistently defined? [Consistency]"
- "Are accessibility requirements specified for all interactive elements? [Coverage, Gap]"
- "Is fallback behavior defined when images fail to load? [Edge Case, Gap]"

### API Requirements Quality: `api.md`
Sample items testing API requirements (not implementation):
- "Are error response formats specified for all failure scenarios? [Completeness]"
- "Are rate limiting requirements quantified with specific thresholds? [Clarity]"
- "Are authentication requirements consistent across all endpoints? [Consistency]"
- "Are retry/timeout requirements defined for external dependencies? [Coverage, Gap]"

### Security Requirements Quality: `security.md`
Sample items testing security requirements (not implementation):
- "Are authentication requirements specified for all protected resources? [Coverage]"
- "Are data protection requirements defined for sensitive information? [Completeness]"
- "Is the threat model documented and requirements aligned to it? [Traceability]"
- "Are security failure/breach response requirements defined? [Gap, Exception Flow]"

## Quality Guidelines

### Effective Checklist Items
Focus on requirement quality, not implementation correctness:

**Ask About Requirements:**
- What's written (or missing) in the specification
- How clear and specific the requirements are
- Whether requirements are complete and consistent
- If acceptance criteria are measurable and testable

**Don't Ask About Implementation:**
- Whether the system works correctly
- If the code meets the requirements  
- How well features are implemented
- User satisfaction with the final product

### Domain-Specific Considerations
Tailor checklists to domain characteristics:

**UX/Interface:** Visual hierarchy, interaction states, accessibility, responsive design
**API/Integration:** Error handling, authentication, rate limiting, versioning
**Security:** Authentication, authorization, data protection, threat modeling
**Performance:** Scalability, response times, resource usage, load handling
**Data:** Entity relationships, validation rules, state transitions, privacy

## Dependencies
- Active feature branch with specification
- Completed `specify` workflow
- Optional: `plan` workflow for technical requirements

## Outputs  
- Domain-specific checklist file: `specs/[feature]/checklists/[domain].md`
- Requirements quality validation items
- Traceability references to specification sections
- Coverage analysis for requirement completeness

## Next Steps
After running this workflow:
- Use checklist to validate specification quality
- Address any incomplete items before implementation
- Run additional domain checklists as needed
- Proceed to implementation once quality gates pass
