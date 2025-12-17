# Analyze Workflow

Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.

## Description
This workflow identifies inconsistencies, duplications, ambiguities, and underspecified items across the three core artifacts (spec.md, plan.md, tasks.md) before or after implementation. It provides structured analysis with remediation recommendations while maintaining constitutional authority.

## Usage
Run this workflow to:
- Validate consistency across specification, plan, and task artifacts
- Identify gaps, duplications, and conflicts between documents
- Ensure constitutional compliance across all artifacts
- Generate actionable remediation recommendations
- Validate readiness for implementation or deployment

**Note:** This workflow assumes complete task breakdown exists in tasks.md. Run after `tasks` workflow completion.

## Workflow Steps

### Step 1: Prerequisites Validation and Context Loading
Validate required artifacts exist and load analysis context:

**Commands to run:**
```bash
# Check current feature branch
git branch --show-current

# Verify all required artifacts exist
ls specs/*/spec.md
ls specs/*/plan.md  
ls specs/*/tasks.md

# Load constitutional principles
ls .clinerules/memory/constitution.md
```

**Abort Conditions:**
If any required file is missing, instruct user to run prerequisite workflows:
- Missing `spec.md` → Run `specify` workflow
- Missing `plan.md` → Run `plan` workflow  
- Missing `tasks.md` → Run `tasks` workflow
- Missing constitution → Run `constitution` workflow

### Step 2: Load Artifacts with Progressive Disclosure
Load only minimal necessary context from each artifact to maintain efficiency:

**From spec.md - Requirements Context:**
- Overview and feature context
- Functional requirements with acceptance criteria
- Non-functional requirements and constraints
- User stories and scenarios
- Success criteria and validation points
- Edge cases and error conditions

**From plan.md - Technical Context:**
- Architecture and technology stack decisions
- Data model references and entity relationships
- Technical constraints and assumptions
- Phase breakdown and implementation approach
- Integration points and external dependencies

**From tasks.md - Implementation Context:**
- Task IDs and descriptions
- Phase grouping and organization
- Parallel execution markers `[P]`
- Referenced file paths and components
- Acceptance criteria and validation points

**From constitution.md - Governance Context:**
- Constitutional principles (MUST/SHOULD requirements)
- Quality gates and compliance standards
- Governance procedures and constraints
- Non-negotiable project standards

### Step 3: Build Semantic Models
Create internal representations for analysis:

**Requirements Inventory:**
- Extract each functional + non-functional requirement with stable key
- Generate slug-based identifiers (e.g., "User can upload file" → `user-can-upload-file`)
- Map acceptance criteria to requirements
- Categorize by priority and complexity

**User Story/Action Inventory:**
- Discrete user actions with acceptance criteria
- Map user scenarios to implementation components
- Identify workflow and interaction patterns

**Task Coverage Mapping:**
- Map each task to one or more requirements or stories
- Use keyword matching and explicit reference patterns
- Identify task-to-requirement relationships
- Flag unmapped tasks and requirements

**Constitutional Rule Set:**
- Extract principle names and normative statements
- Identify MUST vs SHOULD requirements
- Map principles to artifact sections
- Create compliance validation matrix

### Step 4: Detection Analysis Passes
Focus on high-signal findings (limit to 50 findings total):

#### A. Duplication Detection
Identify near-duplicate requirements and redundant specifications:
- Requirements with similar intent but different phrasing
- Duplicate acceptance criteria across different requirements
- Repeated technical specifications in plan and tasks
- Flag lower-quality phrasing for consolidation

#### B. Ambiguity Detection
Flag vague language and unresolved placeholders:
- Vague adjectives: "fast", "scalable", "secure", "intuitive", "robust"
- Unresolved placeholders: TODO, TKTK, ???, `<placeholder>`, `[NEEDS CLARIFICATION]`
- Ambiguous quantifiers: "many", "few", "several", "some"
- Unclear success criteria without objective measures

#### C. Underspecification Detection
Requirements lacking sufficient detail for implementation:
- Requirements with verbs but missing objects or measurable outcomes
- User stories missing acceptance criteria alignment
- Tasks referencing undefined files or components
- Non-functional requirements without quantified targets

#### D. Constitution Alignment Analysis
Validate adherence to project governance principles:
- **CRITICAL:** Any requirement conflicting with constitutional MUST principles
- Missing mandated sections or quality gates from constitution
- **QUALITY:** Deviations from SHOULD principles and recommended practices

#### E. Coverage Gap Analysis
Identify missing mappings between artifacts:
- Requirements with zero associated tasks
- Tasks with no mapped requirement or user story
- User scenarios not covered by task workflows
- Non-functional requirements not reflected in implementation

#### F. Inconsistency Detection
Conflicting information across artifacts:
- Terminology drift (same concept, different names)
- Technical conflicts between plan and tasks
- Task ordering contradictions without dependency justification
- Conflicting requirements preventing implementation

### Step 5: Severity Assignment
Use systematic heuristic for finding prioritization:

**CRITICAL Severity:**
- Violates constitutional MUST requirements
- Missing core specification artifacts
- Requirements with zero coverage blocking functionality
- Conflicting requirements preventing implementation

**HIGH Severity:**
- Duplicate or conflicting requirements affecting implementation
- Ambiguous security/performance attributes
- Untestable acceptance criteria
- Major terminology drift causing confusion

**MEDIUM Severity:**
- Minor terminology drift not affecting implementation
- Missing non-functional task coverage
- Underspecified edge cases with workarounds
- Documentation gaps not blocking implementation

**LOW Severity:**
- Style/wording improvements without functional impact
- Minor redundancy not affecting execution
- Optional optimization opportunities

### Step 6: Generate Analysis Report
Produce comprehensive analysis report:

```markdown
# Cross-Artifact Analysis Report

**Generated:** [TIMESTAMP]  
**Feature:** [FEATURE NAME]  
**Branch:** [BRANCH NAME]  
**Artifacts:** spec.md, plan.md, tasks.md, constitution.md

## Executive Summary
- **Total Findings:** [N] (Critical: X, High: Y, Medium: Z, Low: W)
- **Coverage:** [X]% requirements mapped to tasks
- **Constitutional Compliance:** [PASS/FAIL]
- **Readiness:** [READY/NEEDS ATTENTION/BLOCKED]

## Findings Summary

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Duplication | HIGH | spec.md:L120-134 | Similar requirements | Merge; keep clearer version |
| C1 | Coverage | CRITICAL | spec.md:FR-5 | No implementation tasks | Add tasks in Phase 3 |
| I1 | Inconsistency | MEDIUM | Multiple | Naming conflicts | Standardize terminology |

## Coverage Analysis

| Requirement | Tasks | Status | Notes |
|-------------|-------|--------|-------|
| user-auth | SEC-001, SEC-002 | ✓ Complete | Good coverage |
| data-validation | DATA-001, TEST-001 | ✓ Adequate | |
| performance | ✗ None | ✗ Missing | **Needs tasks** |

## Constitutional Compliance
- **CRITICAL Violations:** [COUNT] - [List violations]
- **Status:** [PASS/FAIL] - [Overall assessment]

## Metrics
- **Requirements:** [N] total, [X]% covered by tasks
- **Tasks:** [N] total, [Y]% mapped to requirements  
- **Ambiguities:** [N] unresolved
- **Duplications:** [N] consolidation opportunities
- **Critical Issues:** [N] blocking implementation

## Next Actions

**Immediate (Critical/High):**
1. [Specific action with file reference]
2. [Another critical action]

**Recommended (Medium/Low):**
1. [Improvement suggestion]
2. [Enhancement opportunity]

**Readiness Assessment:**
- Critical issues present: Must resolve before implementation
- High issues only: Recommended to resolve, can proceed with caution
- Medium/Low only: Safe to proceed, address in parallel
- No issues: Ready for immediate implementation
```

### Step 7: Remediation Recommendations
Provide actionable guidance:

**Issue-Specific Remediation:**
- Root cause analysis for each major finding
- Step-by-step resolution guidance
- Validation methods to verify fixes
- Impact assessment if not addressed

**Process Improvements:**
- Workflow modifications to prevent similar issues
- Quality gate enhancements
- Template improvements for future features

**Ask for Remediation Permission:**
"Would you like me to suggest concrete remediation edits for the top [N] issues?"

### Step 8: Final Validation and Next Steps
Complete analysis with clear guidance:

**Analysis Quality Check:**
- All artifacts reviewed systematically
- Findings prioritized by impact
- Recommendations are actionable
- Cross-references accurate

**Next Steps Guidance:**
```bash
# Suggested commit after fixes
git commit -m "docs: resolve cross-artifact analysis findings

- Fixed [N] critical consistency issues
- Improved requirement coverage to [X]%
- Ensured constitutional compliance
- Ready for implementation phase"
```

## Quality Guidelines

### Analysis Effectiveness
**Focus Areas:**
- High-impact findings over exhaustive documentation
- Actionable issues over theoretical concerns
- Implementation readiness over perfection
- Constitutional compliance as non-negotiable

**Communication Standards:**
- Use specific artifact references (files, sections, line numbers)
- Provide concrete examples rather than abstract descriptions
- Link findings to remediation actions
- Balance thoroughness with clarity

### Token Efficiency
**Progressive Disclosure:**
- Load minimal context for analysis
- Focus on cross-references and conflicts
- Summarize rather than duplicate content
- Prioritize findings by severity and impact

## Dependencies
- Completed specification (`specify` workflow)
- Implementation plan (`plan` workflow)  
- Task breakdown (`tasks` workflow)
- Project constitution for compliance validation

## Outputs
- Cross-artifact analysis report
- Findings table with severity and recommendations
- Coverage analysis matrix
- Constitutional compliance assessment
- Remediation guidance and next steps

## Next Steps
After running this workflow:
- Address critical and high-severity findings
- Update artifacts based on recommendations
- Re-run analysis to validate fixes
- Proceed to implementation with confidence
- Use lessons learned to improve future workflows
