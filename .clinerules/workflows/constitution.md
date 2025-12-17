# Constitution Workflow

Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.

## Description
This workflow manages the project constitution at `.clinerules/memory/constitution.md`. It handles collecting principle values, filling templates, managing versioning, and propagating changes across dependent artifacts.

## Usage
Run this workflow to:
- Create a new project constitution from scratch
- Update existing constitution principles
- Manage constitution versioning
- Ensure consistency across all dependent templates

## Workflow Steps

### Step 1: Load or Create Constitution Template
First, check if a constitution already exists and load it, or create from template if it doesn't exist.

**Commands to run:**
```bash
# Check if constitution exists
ls .clinerules/memory/constitution.md
```

If the file doesn't exist, we'll create a basic template structure.

### Step 2: Collect Constitution Values
Gather information for the following placeholders:
- `[PROJECT_NAME]` - Name of the project
- `[PRINCIPLE_X_NAME]` - Names of core principles (user specified number)
- `[PRINCIPLE_X_CONTENT]` - Content for each principle
- `[RATIFICATION_DATE]` - Original adoption date
- `[LAST_AMENDED_DATE]` - Most recent amendment date
- `[CONSTITUTION_VERSION]` - Semantic version (MAJOR.MINOR.PATCH)

**Version Bumping Rules:**
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Step 3: Draft Constitution Content
Replace all placeholders with concrete values:
- No bracketed tokens should remain (except intentionally retained slots)
- Preserve heading hierarchy
- Ensure each Principle section has: name, rules, rationale
- Include Governance section with amendment procedures

### Step 4: Consistency Propagation
Update dependent templates to align with constitution changes:
- `.clinerules/templates/plan-template.md` - Constitution Check sections
- `.clinerules/templates/spec-template.md` - Scope/requirements alignment
- `.clinerules/templates/tasks-template.md` - Task categorization alignment
- Command files in workflows - Remove outdated references

### Step 5: Generate Sync Impact Report
Create an HTML comment at the top of the constitution with:
- Version change (old → new)
- Modified principles
- Added/removed sections  
- Templates requiring updates
- Follow-up TODOs

### Step 6: Validation
Before finalizing:
- No unexplained bracket tokens remain
- Version matches report
- Dates in ISO format (YYYY-MM-DD)
- Principles are declarative and testable
- Avoid vague language

### Step 7: Save and Report
Write completed constitution and provide summary with:
- New version and bump rationale
- Files flagged for manual follow-up
- Suggested commit message

## Example Constitution Template Structure

```markdown
# Project Constitution

**Version:** 1.0.0  
**Ratified:** 2024-01-01  
**Last Amended:** 2024-01-01  

## Project Identity

**Project Name:** [PROJECT_NAME]

## Core Principles

### [PRINCIPLE_1_NAME]
[PRINCIPLE_1_CONTENT]

**Rationale:** [PRINCIPLE_1_RATIONALE]

### [PRINCIPLE_2_NAME]  
[PRINCIPLE_2_CONTENT]

**Rationale:** [PRINCIPLE_2_RATIONALE]

## Governance

### Amendment Process
Constitutional changes require:
1. Formal proposal with rationale
2. Impact analysis on existing artifacts
3. Version bump following semantic versioning
4. Update propagation to dependent templates

### Compliance Review
All specifications and plans must demonstrate alignment with constitutional principles before implementation.

### Versioning Policy
- Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH)
- Version increments trigger dependency updates
- Breaking changes require MAJOR version bump
```

## Interactive Process

When running this workflow:

1. **Principle Collection**: Ask user for number of principles and collect each one
2. **Content Gathering**: For each principle, collect name, content, and rationale
3. **Version Management**: Determine appropriate version bump based on changes
4. **Validation**: Review all content before finalizing
5. **Propagation**: Update dependent files and report changes

## Dependencies
- None (this is a foundation workflow)

## Outputs
- `.clinerules/memory/constitution.md` - Updated constitution
- Sync impact report
- List of dependent files to update

## Next Steps
After running this workflow:
- Review and update dependent templates as needed
- Run `specify` workflow to create feature specifications
- Ensure all other workflows reference updated principles
