# Specify Workflow

Create or update feature specification from a natural language feature description.

## Description
This workflow creates comprehensive feature specifications from user descriptions. It handles branch creation, spec generation, validation, and clarification processes to ensure specifications are complete and ready for planning.

## Usage
Run this workflow with a feature description to:
- Generate a concise branch name from the description
- Create a new feature branch and directory structure
- Write a complete specification using templates
- Validate specification quality
- Handle clarification questions for ambiguous requirements

## Workflow Steps

### Step 1: Generate Branch Name
Create a 2-4 word short name from the feature description:
- Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
- Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
- Keep it descriptive but concise

**Examples:**
- "I want to add user authentication" → "user-auth"
- "Implement OAuth2 integration for the API" → "oauth2-api-integration" 
- "Create a dashboard for analytics" → "analytics-dashboard"
- "Fix payment processing timeout bug" → "fix-payment-timeout"

### Step 2: Check for Existing Branches
Before creating a new branch, find the highest feature number:

**Commands to run:**
```bash
# Fetch all remote branches
git fetch --all --prune

# Check remote branches for pattern
git ls-remote --heads origin | findstr /R "refs/heads/[0-9]*-<short-name>$"

# Check local branches  
git branch | findstr /R "^[* ]*[0-9]*-<short-name>$"

# Check specs directories
dir specs | findstr /R "^[0-9]*-<short-name>$"
```

Determine next available number (highest + 1, or 1 if none found).

### Step 3: Create Feature Branch and Directory
Create the branch and initialize the spec structure:

**Commands to run:**
```bash
# Create and checkout new branch
git checkout -b "<number>-<short-name>"

# Create specs directory
New-Item -ItemType Directory -Path "specs/<number>-<short-name>" -Force
New-Item -ItemType Directory -Path "specs/<number>-<short-name>/checklists" -Force

# Initialize spec file
New-Item -ItemType File -Path "specs/<number>-<short-name>/spec.md" -Force
```

### Step 4: Load Specification Template
Use the template structure for consistent specification format. If template doesn't exist, use the built-in structure:

```markdown
# [FEATURE NAME]

**Created:** [DATE]
**Status:** Draft
**Branch:** [BRANCH-NAME]

## Overview
Brief description of what this feature accomplishes and why it's needed.

## User Stories
- As a [user type], I want [goal] so that [benefit]
- As a [user type], I want [goal] so that [benefit]

## Functional Requirements
### FR-1: [Requirement Name]
**Description:** Clear, testable requirement description
**Acceptance Criteria:**
- Specific, measurable criteria
- Observable behavior or outcome
- Success conditions

## Non-Functional Requirements
### NFR-1: Performance
**Description:** Performance requirements with specific metrics
**Acceptance Criteria:**
- Response time targets
- Throughput requirements
- Scalability limits

### NFR-2: Security  
**Description:** Security and privacy requirements
**Acceptance Criteria:**
- Authentication/authorization requirements
- Data protection measures
- Compliance requirements

## User Scenarios & Testing
### Primary Flow
1. User action
2. System response
3. Expected outcome

### Alternative Flows
- Scenario variations
- Edge cases
- Error conditions

## Success Criteria
Measurable, technology-agnostic outcomes:
- Quantitative metrics (time, performance, volume)
- Qualitative measures (user satisfaction, task completion)
- Each criterion must be verifiable without implementation details

## Key Entities (if applicable)
- Entity name, attributes, relationships
- Data validation rules
- State transitions

## Assumptions
- Documented reasonable defaults
- Environmental assumptions
- Technical constraints

## Out of Scope
Explicitly excluded features or requirements for this iteration.
```

### Step 5: Generate Specification Content
Fill the template with concrete details derived from the feature description:

**Generation Process:**
1. Parse user description and extract key concepts
2. Identify actors, actions, data, and constraints
3. Make informed guesses for unclear aspects
4. Use reasonable defaults for unspecified details
5. Generate testable functional requirements
6. Define measurable success criteria
7. Create realistic user scenarios

**Clarification Guidelines:**
- Maximum 3 `[NEEDS CLARIFICATION: specific question]` markers total
- Only mark unclear aspects that significantly impact scope or UX
- Prioritize: scope > security/privacy > UX > technical details
- Make informed guesses based on context and industry standards

### Step 6: Specification Quality Validation
After writing the initial spec, validate against quality criteria:

**Create Quality Checklist:**
Generate `specs/<number>-<short-name>/checklists/requirements.md`:

```markdown
# Specification Quality Checklist: [FEATURE NAME]

**Purpose:** Validate specification completeness and quality before proceeding to planning
**Created:** [DATE]
**Feature:** [Link to spec.md]

## Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs  
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

## Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Success criteria are technology-agnostic
- [ ] All acceptance scenarios are defined
- [ ] Edge cases are identified
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Feature Readiness  
- [ ] All functional requirements have clear acceptance criteria
- [ ] User scenarios cover primary flows
- [ ] Feature meets measurable outcomes defined in Success Criteria
- [ ] No implementation details leak into specification

## Notes
Items marked incomplete require spec updates before `clarify` or `plan` workflows.
```

**Run Validation:**
1. Review spec against each checklist item
2. Document specific issues found
3. Update spec to address issues (max 3 iterations)
4. Handle `[NEEDS CLARIFICATION]` markers

### Step 7: Handle Clarification Markers
If `[NEEDS CLARIFICATION]` markers remain:

**Process:**
1. Extract all markers (max 3)
2. Present options to user in this format:

```markdown
## Question [N]: [Topic]

**Context:** [Quote relevant spec section]
**What we need to know:** [Specific question]

**Suggested Answers:**
| Option | Answer | Implications |
|--------|--------|--------------|
| A | [First answer] | [What this means] |
| B | [Second answer] | [What this means] |
| C | [Third answer] | [What this means] |
| Custom | Provide your own | [How to provide input] |

**Your choice:** _[Wait for response]_
```

3. Present all questions together
4. Wait for user responses
5. Update spec by replacing markers with selected answers
6. Re-run validation

### Step 8: Finalize and Report
After validation passes:

**Commands to run:**
```bash
# Add files to git
git add specs/<number>-<short-name>/

# Commit initial spec
git commit -m "feat: add specification for <short-name> (#<number>)"
```

**Report completion with:**
- Branch name and spec file path
- Checklist results summary
- Readiness for next phase (`clarify` or `plan`)
- Any remaining action items

## Quality Guidelines

### Focus on WHAT and WHY
- Describe what users need and why it matters
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Write for business stakeholders, not developers

### Success Criteria Requirements
Success criteria must be:
1. **Measurable:** Include specific metrics (time, percentage, count, rate)
2. **Technology-agnostic:** No frameworks, languages, databases, tools
3. **User-focused:** Outcomes from user/business perspective  
4. **Verifiable:** Can be tested without knowing implementation

**Good Examples:**
- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"

**Bad Examples:**
- "API response time is under 200ms" (too technical)
- "React components render efficiently" (framework-specific)
- "Redis cache hit rate above 80%" (technology-specific)

### Common Reasonable Defaults
Don't ask about these - use industry standards:
- Data retention: Standard practices for the domain
- Performance targets: Standard web/mobile expectations
- Error handling: User-friendly messages with fallbacks
- Authentication: Session-based or OAuth2 for web apps
- Integration patterns: RESTful APIs unless specified

## Dependencies
- Git repository initialized
- Optional: `.clinerules/templates/spec-template.md`

## Outputs
- New feature branch: `<number>-<short-name>`
- Specification file: `specs/<number>-<short-name>/spec.md`
- Quality checklist: `specs/<number>-<short-name>/checklists/requirements.md`
- Git commit with initial specification

## Next Steps
After running this workflow:
- Run `clarify` workflow if clarification needed
- Run `plan` workflow to create implementation plan
- Ensure constitution alignment before proceeding
