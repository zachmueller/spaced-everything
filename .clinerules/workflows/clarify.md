# Clarify Workflow

Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.

## Description
This workflow detects and reduces ambiguity or missing decision points in feature specifications. It performs structured analysis, generates prioritized clarification questions, and updates the spec with user responses.

## Usage
Run this workflow to:
- Scan specifications for ambiguities and coverage gaps
- Generate targeted clarification questions (max 5)
- Collect user responses interactively
- Update specifications with clarified requirements
- Validate completeness before planning phase

**Note:** This workflow should run BEFORE the `plan` workflow. Skipping clarification increases downstream rework risk.

## Workflow Steps

### Step 1: Load Feature Context
Load the current specification and perform environment check:

**Commands to run:**
```bash
# Check if we're in a feature branch
git branch --show-current

# Verify spec file exists
ls specs/*/spec.md

# Load the current spec for analysis
```

Parse the spec file path and feature directory structure.

### Step 2: Structured Ambiguity Scan
Perform systematic analysis using this taxonomy. Mark each category as: **Clear** / **Partial** / **Missing**

**Functional Scope & Behavior:**
- Core user goals & success criteria definition
- Explicit out-of-scope declarations
- User roles / personas differentiation
- Feature boundaries and limitations

**Domain & Data Model:**
- Entities, attributes, relationships
- Identity & uniqueness rules  
- Lifecycle/state transitions
- Data volume / scale assumptions

**Interaction & UX Flow:**
- Critical user journeys / sequences
- Error/empty/loading states
- Accessibility or localization notes
- Input validation and feedback

**Non-Functional Quality Attributes:**
- Performance (latency, throughput targets)
- Scalability (horizontal/vertical, limits)
- Reliability & availability (uptime, recovery expectations)
- Observability (logging, metrics, tracing signals)
- Security & privacy (authN/Z, data protection, threat assumptions)
- Compliance / regulatory constraints

**Integration & External Dependencies:**
- External services/APIs and failure modes
- Data import/export formats
- Protocol/versioning assumptions
- Third-party service requirements

**Edge Cases & Failure Handling:**
- Negative scenarios and error conditions
- Rate limiting / throttling behavior
- Conflict resolution (concurrent operations)
- Recovery and rollback procedures

**Constraints & Tradeoffs:**
- Technical constraints (language, storage, hosting)
- Explicit tradeoffs or rejected alternatives
- Resource limitations and assumptions

**Terminology & Consistency:**
- Canonical glossary terms
- Avoided synonyms / deprecated terms
- Cross-reference consistency

**Completion Signals:**
- Acceptance criteria testability
- Measurable Definition of Done indicators
- Verification and validation methods

### Step 3: Generate Clarification Questions
Create prioritized queue of candidate questions (maximum 5 total):

**Question Constraints:**
- Maximum 10 questions across entire session
- Each answerable with either:
  - Multiple-choice selection (2-5 mutually exclusive options)
  - Short phrase answer (≤5 words)
- Must materially impact architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance
- Balance category coverage - avoid multiple low-impact questions when high-impact areas remain unresolved
- Exclude already answered questions, stylistic preferences, or plan-level details

**Prioritization Formula:**
`Priority = Impact × Uncertainty`

Where Impact considers:
- Architecture decisions
- Data model changes  
- Security implications
- User experience changes
- Compliance requirements

### Step 4: Interactive Clarification Process
Present questions one at a time with recommendations:

**For Multiple Choice Questions:**
1. **Analyze all options** and determine most suitable based on:
   - Best practices for project type
   - Common patterns in similar implementations  
   - Risk reduction (security, performance, maintainability)
   - Alignment with project goals/constraints

2. **Present recommended option prominently:**
   ```markdown
   **Recommended:** Option [X] - <reasoning in 1-2 sentences>
   
   | Option | Description |
   |--------|-------------|
   | A | <Option A description> |
   | B | <Option B description> |
   | C | <Option C description> |
   | Short | Provide different short answer (≤5 words) |
   
   Reply with option letter (e.g., "A"), "yes"/"recommended" to accept recommendation, or provide your own short answer.
   ```

**For Short Answer Questions:**
1. **Provide suggested answer** based on best practices:
   ```markdown
   **Suggested:** <proposed answer> - <brief reasoning>
   
   Format: Short answer (≤5 words). Reply "yes"/"suggested" to accept, or provide your own answer.
   ```

**Response Handling:**
- "yes"/"recommended"/"suggested" → Use provided recommendation/suggestion
- Option letter → Use selected option
- Custom answer → Validate format and use if acceptable
- Ambiguous → Ask for quick disambiguation (doesn't count as new question)

**Stopping Conditions:**
- All critical ambiguities resolved (remaining become unnecessary)
- User signals completion ("done", "good", "no more")
- Reach 5 asked questions limit
- Never reveal future queued questions in advance

### Step 5: Incremental Spec Updates
After EACH accepted answer, immediately update the specification:

**First Update Setup:**
- Ensure `## Clarifications` section exists after overview section
- Create `### Session YYYY-MM-DD` subheading for today
- Append: `- Q: <question> → A: <final answer>`

**Apply Clarification to Appropriate Section:**
- **Functional ambiguity** → Update/add bullet in Functional Requirements
- **User interaction/actor distinction** → Update User Stories or add actor constraints
- **Data shape/entities** → Update Data Model with fields, types, relationships
- **Non-functional constraint** → Add/modify measurable criteria in NFR section
- **Edge case/negative flow** → Add bullet under Edge Cases/Error Handling
- **Terminology conflict** → Normalize term across spec, note changes

**Update Guidelines:**
- Replace ambiguous statements rather than duplicating
- Remove obsolete contradictory text
- Preserve formatting and heading hierarchy
- Keep clarifications minimal and testable
- Save file after each integration (atomic updates)

### Step 6: Validation After Each Update
Perform validation after every spec write:

**Check Items:**
- Clarifications section has exactly one bullet per accepted answer
- Total asked questions ≤ 5
- Updated sections contain no lingering vague placeholders
- No contradictory earlier statements remain
- Markdown structure remains valid
- Terminology consistency across all updated sections

### Step 7: Session Completion Report
After questioning loop ends, provide comprehensive report:

**Session Statistics:**
- Number of questions asked & answered
- Path to updated spec file
- Sections touched (list names)

**Coverage Summary Table:**
| Category | Status | Action Taken |
|----------|--------|--------------|
| Functional Scope | Resolved | Was Partial, addressed via Q1 |
| Data Model | Deferred | Exceeds question quota, suitable for planning |
| Security | Clear | Already sufficient |
| Integration | Outstanding | Still Partial, low impact |

**Status Definitions:**
- **Resolved:** Was Partial/Missing, now addressed
- **Deferred:** Exceeds question quota or better suited for planning phase
- **Clear:** Already sufficient from start
- **Outstanding:** Still Partial/Missing but low impact

**Next Steps Recommendation:**
- If Outstanding/Deferred remain → Assess if should proceed to `plan` or run `clarify` again
- Suggest next appropriate workflow
- Flag any high-impact items still unresolved

### Step 8: Finalize Updates
Commit clarified specification:

**Commands to run:**
```bash
# Add updated spec
git add specs/*/spec.md

# Commit clarifications
git commit -m "docs: clarify specification requirements

- Added <number> clarification questions and answers
- Updated <sections> sections
- Resolved <category> ambiguities"
```

## Quality Guidelines

### Effective Clarification Questions
**Good Examples:**
- "Should user authentication be required for read-only operations or only modifications?"
- "What happens when external API is unavailable: show cached data, error message, or disable feature?"
- "Should search results be paginated (how many per page) or infinite scroll?"

**Poor Examples:**
- "What technology stack should we use?" (too early, planning concern)
- "What color should the buttons be?" (too specific, implementation detail)
- "Should we use React or Vue?" (technology choice, not requirement)

### Answer Integration Best Practices
- **Specific and Actionable:** Convert vague answers into concrete requirements
- **Testable:** Ensure clarifications can be verified
- **Consistent:** Maintain terminology and style consistency
- **Preserve Context:** Keep original question context visible

### Risk Assessment
Prioritize clarifications that address:
1. **High Risk:** Security, data loss, compliance violations
2. **Medium Risk:** User experience degradation, performance issues  
3. **Low Risk:** Aesthetic choices, minor workflow variations

## Dependencies
- Active feature branch with spec.md
- Git repository for version control
- Completed `specify` workflow

## Outputs
- Updated specification with clarifications
- Clarifications session log
- Coverage analysis report
- Readiness assessment for planning phase

## Next Steps
After running this workflow:
- Review coverage summary for any critical gaps
- Run `plan` workflow to create implementation plan
- Consider re-running `clarify` if high-impact items remain Outstanding

## Error Handling

**Missing Spec File:**
If no spec.md found, instruct user to run `specify` workflow first.

**No Meaningful Ambiguities:**
If all categories are Clear or low-impact, report: "No critical ambiguities detected worth formal clarification" and suggest proceeding to planning.

**User Early Termination:**
Respect user signals ("stop", "done", "proceed") and generate partial completion report.

**Quota Exceeded:**
If 5 questions reached with high-impact categories unresolved, flag them under Deferred with rationale and recommend follow-up action.
