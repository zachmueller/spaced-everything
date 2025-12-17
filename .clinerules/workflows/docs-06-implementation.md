# Workflow: Implementation

**Purpose:** Execute documentation improvements iteratively, tracking progress.

**Status:** Ready for Execution  
**Estimated Time:** Variable (depends on batch size)  
**Output File:** `specs/docs-improvement/6-implementation-log.md`

## Prerequisites

**Required:** 
- All previous workflows must be completed
- Improvement Plan must be reviewed and approved

**Input Dependencies:** 
- `specs/docs-improvement/5-improvement-plan.md` - Task list and priorities
- `specs/docs-improvement/4-documentation-standards.md` - Standards to follow
- Source files from `src/` - Files to improve

## Input Files and Data Sources

- `specs/docs-improvement/5-improvement-plan.md` - Tasks to execute
- `specs/docs-improvement/4-documentation-standards.md` - Standards reference
- Source files requiring documentation improvements

## Execution Instructions

### Step 1: Review the Improvement Plan

Read the plan to understand current batch:

```
<read_file>
<path>specs/docs-improvement/5-improvement-plan.md</path>
</read_file>
```

### Step 2: Select Next Batch

Choose the next batch to work on based on:
- Priority (start with P0 tasks)
- Dependencies (ensure prerequisites are met)
- Logical grouping (complete related files together)
- Available time (match batch size to available effort)

**First Time:** Start with Batch 1 from the plan  
**Subsequent Times:** Select next incomplete batch

### Step 3: Review Documentation Standards

Before starting, review relevant standards:

```
<read_file>
<path>specs/docs-improvement/4-documentation-standards.md</path>
</read_file>
```

Focus on sections relevant to current batch (file headers, class docs, etc.)

### Step 4: Process Each File in Batch

For each file in the current batch:

#### 4a. Read Current State

```
<read_file>
<path>src/[filename]</path>
</read_file>
```

#### 4b. Identify Tasks for This File

From the improvement plan, list tasks for this file:
- Add file header
- Document classes/interfaces
- Document methods
- Add inline comments to complex sections
- Document types

#### 4c. Apply Documentation Standards

For each task:

1. **Analyze the code** to understand:
   - What it does (the implementation)
   - Why it exists (the purpose)
   - How it fits into the system (the context)

2. **Write documentation** that:
   - Follows the standards from workflow 4
   - Explains "why" not just "what"
   - Provides context and rationale
   - Uses appropriate templates
   - Is concise but complete

3. **Use replace_in_file or write_to_file**:
   - Prefer replace_in_file for targeted additions
   - Use write_to_file only if extensively rewriting

#### 4d. Quality Check

After documenting each file, verify:
- [ ] Documentation follows standards
- [ ] Explains "why" not just "what"
- [ ] No redundant or useless comments
- [ ] Technical accuracy
- [ ] Completeness (all planned tasks done)
- [ ] Consistency with existing documentation

### Step 5: Test and Verify

After completing batch:

1. **Build the project** to ensure no syntax errors:
```
<execute_command>
<command>npm run build</command>
<requires_approval>false</requires_approval>
</execute_command>
```

2. **Review changes** - Ensure documentation:
   - Is technically accurate
   - Provides genuine insight
   - Follows standards consistently
   - Improves understanding

### Step 6: Update Implementation Log

Document the work completed:

- Create or update `specs/docs-improvement/6-implementation-log.md`
- Record batch number, date, files modified
- Note improvements made
- Document any challenges encountered
- Assess quality of results

### Step 7: Update Improvement Plan

Mark completed tasks in the plan:

- Update task checkboxes
- Note any deviations from plan
- Document any new tasks discovered
- Adjust estimates if needed

### Step 8: Commit Changes

Following git standards from `.clinerules/git.md`:

```
<execute_command>
<command>git add [modified files]</command>
<requires_approval>false</requires_approval>
</execute_command>

<execute_command>
<command>git commit -m "[Cline] Docs: Completed Batch [N] - [Brief description]

- Added file headers to [files]
- Documented [classes/methods]
- Added inline comments to [areas]

Addresses P[0-3] documentation gaps for [subsystem/feature].

---

[Human input that led to this work]"</command>
<requires_approval>false</requires_approval>
</execute_command>
```

## Output File Specification

Create or update `specs/docs-improvement/6-implementation-log.md` with:

```markdown
# Documentation Implementation Log

**Purpose:** Track progress on documentation improvements

## Session History

### Session [N]: [Date]

**Batch:** [Batch name from plan]  
**Duration:** [Estimated vs. actual time]  
**Status:** Complete / In Progress / Blocked

#### Files Modified

1. **`src/[filename]`**
   - Added file header explaining purpose and context
   - Documented [ClassName] with usage examples
   - Added JSDoc to [N] public methods
   - Added inline comments to [specific sections]
   - **Before:** [X]% comment coverage
   - **After:** [Y]% comment coverage

2. **`src/[another-file]`**
   - [Similar breakdown]

#### Improvements Made

**File Headers:**
- [List files where headers were added]

**Class Documentation:**
- [List classes documented]

**Method Documentation:**
- [List key methods documented]

**Inline Comments:**
- [List areas where complex logic was explained]

**Type Documentation:**
- [List types/interfaces documented]

#### Challenges Encountered

1. **[Challenge 1]**
   - Description: [What was difficult]
   - Resolution: [How it was addressed]

2. **[Challenge 2]**
   - Description: [What was difficult]
   - Resolution: [How it was addressed]

#### Quality Assessment

- **Standards Compliance:** ✅ Excellent / ⚠️ Good / ❌ Needs Improvement
- **Technical Accuracy:** ✅ Verified / ⚠️ Mostly Accurate / ❌ Issues Found
- **Completeness:** ✅ All Tasks Done / ⚠️ Mostly Done / ❌ Incomplete
- **Clarity:** ✅ Clear and Helpful / ⚠️ Adequate / ❌ Confusing

**Notes:** [Any quality concerns or exemplary work]

#### Metrics

- **Tasks Completed:** [N] tasks
- **Files Modified:** [N] files
- **Documentation Added:** [N] lines of comments
- **Coverage Increase:** +[X]% overall

---

[Repeat for each session]

## Overall Progress

### Completion Status

- **P0 Tasks:** [X/Y] complete ([Z]%)
- **P1 Tasks:** [X/Y] complete ([Z]%)
- **P2 Tasks:** [X/Y] complete ([Z]%)
- **Total Tasks:** [X/Y] complete ([Z]%)

### Coverage Metrics

- **Overall Comment Ratio:** [Starting X]% → [Current Y]%
- **Files with Headers:** [X/Y] ([Z]%)
- **Public APIs Documented:** [X/Y] ([Z]%)

### Remaining Work

**Next Batch:** [Batch name]  
**Estimated Effort:** [X] hours  
**Priority:** P[0-3]

**Outstanding High-Priority Tasks:**
1. [Task 1]
2. [Task 2]
3. [Task 3]

## Lessons Learned

### What Worked Well

1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

### What Could Be Improved

1. [Lesson 1]
2. [Lesson 2]

### Adjustments to Standards or Plan

- [Any changes to documentation standards]
- [Any changes to implementation approach]
- [Any changes to prioritization]

## Quality Patterns

### Exemplary Documentation

**File:** `src/[filename]`  
**Section:** [Method/class name]  
**Why it's good:** [Explanation]

```typescript
[Example of excellent documentation]
```

### Areas for Improvement

**Common Issues:**
1. [Issue 1 and how to avoid it]
2. [Issue 2 and how to avoid it]

## Next Steps

1. [Next immediate action]
2. [Following action]
3. [Subsequent action]
```

## Quality Checkpoints

After each implementation session, verify:

- [ ] All planned tasks for batch completed
- [ ] Documentation follows established standards
- [ ] Code still builds without errors
- [ ] Documentation is technically accurate
- [ ] Explanations provide genuine insight
- [ ] No redundant or useless comments added
- [ ] Implementation log updated
- [ ] Improvement plan updated
- [ ] Changes committed with proper message

## Common Pitfalls

**Avoid:**
- Adding comments that just restate code
- Copying examples without customization
- Rushing through to complete batch
- Ignoring edge cases or error conditions
- Forgetting to explain "why"
- Leaving TODOs without context
- Not building/testing after changes

**Instead:**
- Focus on explaining purpose and rationale
- Customize all documentation to specific code
- Take time to understand before documenting
- Document error handling and edge cases
- Always provide context and reasoning
- Include full context in TODOs
- Verify changes don't break anything

## Tips for Effective Implementation

### Understanding Before Documenting

1. **Read the code thoroughly** - Don't document what you don't understand
2. **Trace execution paths** - Understand how code is called
3. **Check git history** - See why code was added or changed
4. **Look for patterns** - Identify design patterns being used
5. **Consider the user** - Think about who reads this code

### Writing Good Documentation

1. **Start with "why"** - Explain purpose before mechanics
2. **Provide context** - Connect to larger system
3. **Use examples** - Show typical usage for complex APIs
4. **Be specific** - Avoid vague generalities
5. **Stay current** - Update docs when code changes

### Managing the Work

1. **One batch at a time** - Complete fully before moving on
2. **Take breaks** - Fresh eyes catch issues
3. **Review own work** - Read docs as if you're new to code
4. **Seek feedback** - Get reviews on early batches
5. **Iterate** - Improve approach based on learnings

## Iterative Execution

This workflow is designed to be run multiple times:

**First Run:** Complete highest priority batch  
**Second Run:** Complete next batch, incorporating lessons  
**Subsequent Runs:** Continue until all planned work complete

**Between Runs:**
- Review quality of previous batch
- Adjust approach if needed
- Get feedback from team
- Update standards if patterns emerge

## Usage Example

To execute this workflow for a specific batch:

```
Please execute the Implementation workflow defined in .clinerules/workflows/docs-06-implementation.md for Batch [N]: [Batch Name]
```

Cline will:
1. Review improvement plan and select batch
2. Read each file in the batch
3. Apply documentation standards
4. Make improvements using replace_in_file
5. Verify changes build successfully
6. Update implementation log with progress
7. Update improvement plan with completed tasks
8. Commit changes following git standards

## Workflow Completion

The documentation improvement process is complete when:

- [ ] All P0 (Critical) tasks completed
- [ ] All P1 (High) tasks completed
- [ ] Documentation standards applied consistently
- [ ] Overall documentation coverage meets targets
- [ ] External documentation updated
- [ ] Implementation log shows consistent quality
- [ ] Team review confirms improvements

At this point, the codebase documentation should be significantly improved and aligned with the "Open and Accessible" principle from the project constitution.
