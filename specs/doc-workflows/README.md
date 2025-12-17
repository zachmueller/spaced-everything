# Documentation Improvement Workflow System

**Version:** 1.0.0  
**Purpose:** A systematic approach for refamiliarizing with and improving documentation in the Spaced Everything project

## Overview

This directory contains the specification and guidance for a six-step workflow system designed to comprehensively review and enhance code documentation. The system breaks down the refamiliarization process into discrete, manageable steps, with outputs stored in `specs/docs-improvement/` for review and iteration.

### Why This System Exists

The Documentation Improvement Workflow System addresses a common challenge in software projects: maintaining clear, accessible documentation as the codebase evolves. This system:

- **Supports the "Open and Accessible" constitutional principle** by ensuring code is well-commented and understandable
- **Provides structure** for systematic documentation review and improvement
- **Creates artifacts** that serve as both analysis and reference documentation
- **Enables iteration** through clear checkpoints and deliverables
- **Lowers contribution barriers** by making the codebase more accessible

## Workflow Execution Order

The workflows must be executed **in sequence**, as each builds on the outputs of the previous step:

```
1. Project Overview
   └─> Creates high-level understanding of architecture and concepts
       │
2. Codebase Map
   └─> Maps all source files, dependencies, and relationships
       │
3. Documentation Audit
   └─> Assesses current documentation state and identifies gaps
       │
4. Documentation Standards
   └─> Defines project-specific documentation guidelines
       │
5. Improvement Plan
   └─> Creates prioritized, actionable improvement tasks
       │
6. Implementation (Iterative)
   └─> Executes improvements and tracks progress
```

### Output Directory Structure

All workflow outputs are stored in `specs/docs-improvement/`:

```
specs/docs-improvement/
├── 1-project-overview.md       # Step 1 output
├── 2-codebase-map.md          # Step 2 output
├── 3-documentation-audit.md   # Step 3 output
├── 4-documentation-standards.md # Step 4 output
├── 5-improvement-plan.md      # Step 5 output
└── 6-implementation-log.md    # Step 6 output (updated iteratively)
```

## Workflow References

Each workflow is defined in `.clinerules/workflows/` and can be executed by explicitly instructing Cline to follow it:

| Workflow | File | Purpose |
|----------|------|---------|
| **1. Project Overview** | `.clinerules/workflows/docs-01-project-overview.md` | Establish high-level understanding of project architecture and concepts |
| **2. Codebase Map** | `.clinerules/workflows/docs-02-codebase-map.md` | Create detailed map of all source files and their relationships |
| **3. Documentation Audit** | `.clinerules/workflows/docs-03-documentation-audit.md` | Assess current documentation state and identify gaps |
| **4. Documentation Standards** | `.clinerules/workflows/docs-04-documentation-standards.md` | Define project-specific documentation guidelines |
| **5. Improvement Plan** | `.clinerules/workflows/docs-05-improvement-plan.md` | Create prioritized, actionable improvement tasks |
| **6. Implementation** | `.clinerules/workflows/docs-06-implementation.md` | Execute improvements iteratively and track progress |

## Usage Examples

### Example 1: Starting the Full Workflow

To begin the documentation improvement process from scratch:

```
User: "Please execute the Project Overview workflow defined in 
.clinerules/workflows/docs-01-project-overview.md"
```

Cline will:
1. Read the workflow definition
2. Gather required input files (README, docs/, manifest.json, etc.)
3. Analyze the project structure and concepts
4. Generate `specs/docs-improvement/1-project-overview.md`
5. Commit the output

After reviewing the output, proceed to the next step:

```
User: "Please execute the Codebase Map workflow defined in 
.clinerules/workflows/docs-02-codebase-map.md"
```

### Example 2: Resuming After Review

If you've reviewed an output and want to proceed:

```
User: "I've reviewed the documentation audit. Please proceed with the 
Documentation Standards workflow."
```

Or with modifications:

```
User: "I've reviewed the improvement plan. Before implementation, please 
add more detail to the P0 tasks in section 3. Then we can proceed with 
implementation."
```

### Example 3: Iterative Implementation

The Implementation workflow is designed to be run multiple times:

```
User: "Execute the Implementation workflow for Batch 1 (main.ts and 
settings.ts)"
```

After completion:

```
User: "Execute the Implementation workflow for Batch 2 (frontmatterQueue.ts)"
```

### Example 4: Workflow Customization

You can modify workflow execution if needed:

```
User: "Execute the Documentation Audit workflow, but focus specifically 
on public API methods and skip internal utilities for now."
```

## Step-by-Step Guide

### Phase 1: Analysis (Workflows 1-3)

**Goal:** Understand the project and identify documentation gaps

1. **Execute Project Overview Workflow**
   - Reviews README, docs/, manifest.json, package.json
   - Output: High-level architecture understanding
   - ✅ Checkpoint: Can you explain the project's purpose to a new contributor?

2. **Execute Codebase Map Workflow**
   - Maps all source files and dependencies
   - Output: Detailed module relationship diagram
   - ✅ Checkpoint: Do you understand what each file does and how they relate?

3. **Execute Documentation Audit Workflow**
   - Assesses current documentation coverage and quality
   - Output: Comprehensive gap analysis
   - ✅ Checkpoint: Do you know which areas need documentation most urgently?

**Review Point:** After Step 3, review all three outputs. You should have a complete picture of the project and its documentation needs before proceeding.

### Phase 2: Planning (Workflows 4-5)

**Goal:** Define standards and create an actionable improvement plan

4. **Execute Documentation Standards Workflow**
   - Defines project-specific documentation guidelines
   - Output: Documentation style guide and templates
   - ✅ Checkpoint: Are the standards clear and achievable?

5. **Execute Improvement Plan Workflow**
   - Creates prioritized, actionable tasks
   - Output: Batched improvement checklist
   - ✅ Checkpoint: Is the plan realistic and properly prioritized?

**Review Point:** After Step 5, review the standards and plan. Adjust priorities if needed before starting implementation.

### Phase 3: Implementation (Workflow 6)

**Goal:** Systematically improve documentation

6. **Execute Implementation Workflow (Iteratively)**
   - Implements improvements batch by batch
   - Output: Updated source files + implementation log
   - ✅ Checkpoint: After each batch, verify documentation meets standards

**Review Point:** After each implementation batch, review the changes. Adjust approach if needed before the next batch.

## Troubleshooting Guide

### Issue: Workflow Output is Incomplete

**Symptoms:**
- Output file is missing expected sections
- Analysis seems superficial
- Key information is not captured

**Solutions:**
1. Check if prerequisites were completed (previous workflows)
2. Verify all required input files exist and are readable
3. Re-run the workflow with explicit instructions to include missing sections
4. If consistently incomplete, the workflow definition may need refinement

**Example Fix:**
```
User: "The codebase map is missing dependency information for main.ts. 
Please update the map to include all imports and what imports main.ts."
```

### Issue: Workflow Takes Too Long

**Symptoms:**
- Cline appears stuck reading many files
- Workflow doesn't complete in reasonable time
- Multiple retries needed

**Solutions:**
1. **For large codebases:** Break the workflow into smaller chunks
2. **For Codebase Map:** Process files in batches by directory
3. **For Audit:** Focus on priority files first (main modules, public APIs)
4. Consider running workflows during off-hours if the project is very large

**Example Fix:**
```
User: "Execute the Codebase Map workflow, but only process files in src/ 
for now. We'll handle subdirectories separately."
```

### Issue: Output Format Doesn't Match Template

**Symptoms:**
- Generated markdown structure differs from examples
- Sections are in wrong order
- Required information is in wrong format

**Solutions:**
1. Explicitly reference the workflow definition during execution
2. Provide the expected format as part of the instruction
3. Update the workflow definition to be more explicit about format
4. Use replace_in_file to fix formatting issues in output

**Example Fix:**
```
User: "The documentation audit output should follow the exact format 
specified in docs-03-documentation-audit.md. Please regenerate with 
proper section structure."
```

### Issue: Standards Don't Match Project Style

**Symptoms:**
- Documentation standards workflow outputs generic guidelines
- Standards don't align with existing well-documented code
- Team disagrees with proposed standards

**Solutions:**
1. Before running Standards workflow, identify good documentation examples
2. Explicitly instruct Cline to analyze existing patterns
3. After generation, manually edit standards to match team preferences
4. Re-run Implementation with updated standards

**Example Fix:**
```
User: "Before generating documentation standards, read main.ts lines 1-50 
as an example of our preferred documentation style. Use this as a 
reference for the standards."
```

### Issue: Improvement Plan Priorities Seem Wrong

**Symptoms:**
- Low-impact items marked as P0
- Critical gaps marked as low priority
- User-facing features not prioritized

**Solutions:**
1. Review the plan and manually adjust priorities
2. Provide explicit priority criteria before plan generation
3. Regenerate specific sections with corrected priorities
4. Document priority rationale in the plan

**Example Fix:**
```
User: "Update the improvement plan to prioritize user-facing API 
documentation (main.ts, settings.ts) as P0, and internal utilities 
(logger.ts, types.ts) as P1."
```

### Issue: Implementation Changes Break Functionality

**Symptoms:**
- Added comments cause TypeScript errors
- Documentation changes affect behavior
- Tests fail after documentation updates

**Solutions:**
1. Always review changes before committing
2. Run builds/tests after documentation changes
3. Ensure comments don't affect code logic
4. Use replace_in_file carefully to avoid code modifications

**Prevention:**
```
User: "Execute Implementation workflow for Batch 1. After making changes, 
run 'npm run build' to verify no errors were introduced."
```

### Issue: Can't Find Workflow Definition

**Symptoms:**
- Error message about missing file
- Workflow file not in expected location

**Solutions:**
1. Verify workflow files exist in `.clinerules/workflows/`
2. Check filename matches: `docs-01-project-overview.md` (note the hyphen format)
3. List files to confirm: `ls .clinerules/workflows/docs-*.md`
4. If missing, refer to `specs/doc-workflows/OVERVIEW.md` for specifications

**Example Fix:**
```
User: "List the files in .clinerules/workflows/ to show me all available 
documentation workflows."
```

## Quality Checkpoints

Use these checkpoints to validate workflow outputs:

### After Project Overview (Workflow 1)
- [ ] Project purpose is clearly explained
- [ ] Core concepts are defined and understandable
- [ ] Architecture diagram or description is present
- [ ] Technology stack is identified
- [ ] Key user workflows are documented
- [ ] Output could onboard a new developer

### After Codebase Map (Workflow 2)
- [ ] All source files are listed
- [ ] Each file's purpose is clear
- [ ] Dependencies are mapped
- [ ] Relationships between modules are documented
- [ ] Data flow is explained
- [ ] Output could guide refactoring decisions

### After Documentation Audit (Workflow 3)
- [ ] Documentation metrics are provided
- [ ] Each file is assessed individually
- [ ] Critical gaps are prioritized
- [ ] Good examples are identified
- [ ] Quantitative measurements are included
- [ ] Output could justify documentation work

### After Documentation Standards (Workflow 4)
- [ ] Standards are specific and actionable
- [ ] Examples demonstrate each standard
- [ ] Standards match project style
- [ ] Anti-patterns are documented
- [ ] Standards are realistic to implement
- [ ] Output could guide new contributors

### After Improvement Plan (Workflow 5)
- [ ] Tasks are prioritized (P0-P3)
- [ ] Each task is specific and actionable
- [ ] Effort estimates are included
- [ ] Tasks are grouped into logical batches
- [ ] Dependencies are noted
- [ ] Output could guide implementation work

### After Implementation (Workflow 6)
- [ ] All changes follow documentation standards
- [ ] Code functionality is unchanged
- [ ] Documentation adds value (explains why, not what)
- [ ] Complex sections are clarified
- [ ] Implementation log is updated
- [ ] Output improves codebase accessibility

## Tips for Success

### 1. Review Each Output Before Proceeding
Don't rush through the workflows. Each output serves as input for the next step. Take time to review, validate, and adjust before moving forward.

### 2. Iterate on Standards Before Implementation
The Documentation Standards workflow is crucial. Get this right before starting implementation. It's easier to adjust standards than to redo documentation.

### 3. Start with High-Value Files
In the Implementation phase, prioritize user-facing APIs and complex algorithms. These provide the most value to contributors.

### 4. Commit After Each Workflow
Following git.md standards, commit each workflow output separately. This creates checkpoints you can return to if needed.

### 5. Use Plan Mode for Complex Decisions
If you're unsure about priorities or standards, switch to PLAN MODE to discuss options before proceeding.

### 6. Don't Over-Document
Remember the "Simplicity First" principle. Document what needs explanation, not every line of code. Focus on why, not what.

### 7. Keep Implementation Batches Small
Process 1-3 files per implementation batch. This allows for quality review and prevents overwhelming changes.

### 8. Update Tasks Tracking
If using `tasks.md` to track workflow progress, keep it updated as you complete each workflow step.

## Integration with Other Systems

### Git Workflow Integration
All workflow outputs should be committed following `.clinerules/git.md`:
- Commit after each workflow completion
- Use descriptive commit messages
- Include workflow name in commit message
- Reference the human's request

### Task Tracking Integration
If using `.clinerules/task-tracking.md` conventions:
- Create a `tasks.md` for the documentation improvement project
- Track each workflow as a task
- Update status as workflows complete
- Note any blockers or decisions

### Constitutional Alignment
This workflow system directly supports:
- **Open and Accessible**: Creates documentation for all skill levels
- **Simplicity First**: Focuses on high-value documentation
- **Extensible for Power Users**: Documents architecture for customization

## Next Steps

Once you've completed all six workflows:

1. **Review Overall Progress**: Compare documentation audit metrics before/after
2. **Validate Accessibility**: Can a new contributor understand the codebase?
3. **Update External Docs**: Incorporate learnings into README and docs/
4. **Maintain Standards**: Use the standards for future code contributions
5. **Iterate as Needed**: Re-run audit periodically to catch new gaps

## Getting Help

If you encounter issues not covered in this guide:

1. Review the detailed workflow specification in `OVERVIEW.md`
2. Examine the workflow definition files in `.clinerules/workflows/`
3. Check if constitutional principles provide guidance
4. Consider whether the workflow definitions need refinement

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-18 | Initial README creation with full workflow documentation |

---

**Related Documentation:**
- [Workflow System Overview](./OVERVIEW.md) - Detailed specification of all workflows
- [Git Standards](./../.clinerules/git.md) - Commit conventions
- [Task Tracking](./../.clinerules/task-tracking.md) - Progress tracking standards
- [Project Constitution](./../.clinerules/memory/constitution.md) - Guiding principles
