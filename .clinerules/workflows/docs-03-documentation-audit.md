# Workflow: Documentation Audit

**Purpose:** Assess the current state of documentation and identify specific gaps.

**Status:** Ready for Execution  
**Estimated Time:** 25-35 minutes  
**Output File:** `specs/docs-improvement/3-documentation-audit.md`

## Prerequisites

**Required:** 
- Project Overview workflow must be completed
- Codebase Map workflow must be completed

**Input Dependencies:** 
- `specs/docs-improvement/1-project-overview.md` - Project context
- `specs/docs-improvement/2-codebase-map.md` - File structure and relationships

## Input Files and Data Sources

- All files in `src/` directory (for code analysis)
- `specs/docs-improvement/1-project-overview.md` - Understanding project purpose
- `specs/docs-improvement/2-codebase-map.md` - Understanding code structure
- `README.md` - External documentation
- `docs/` directory - Additional documentation

## Execution Instructions

### Step 1: Read Prerequisites

Review the outputs from previous workflows:

```
<read_file>
<path>specs/docs-improvement/1-project-overview.md</path>
</read_file>

<read_file>
<path>specs/docs-improvement/2-codebase-map.md</path>
</read_file>
```

### Step 2: Analyze Each Source File for Documentation

For each file in `src/`, perform a documentation audit:

```
<read_file>
<path>src/[filename]</path>
</read_file>
```

**For each file, assess:**

1. **File-Level Documentation:**
   - Is there a file header comment?
   - Does it explain the file's purpose?
   - Does it provide context for why the file exists?

2. **Class/Interface Documentation:**
   - Are classes documented with purpose?
   - Are key methods documented?
   - Are complex algorithms explained?
   - Are type parameters documented?

3. **Function Documentation:**
   - Are public functions documented?
   - Do comments explain "why" not just "what"?
   - Are parameters and return values explained?
   - Are side effects documented?

4. **Inline Comments:**
   - Are complex code sections explained?
   - Are non-obvious decisions documented?
   - Are TODOs and FIXMEs noted?
   - Is the comment-to-code ratio appropriate?

5. **Type Documentation:**
   - Are interfaces and types documented?
   - Are complex type definitions explained?
   - Are enum values documented?

### Step 3: Calculate Documentation Metrics

For each file, calculate:

**Comment Line Count:**
- Count lines with `//` or `/* */` comments
- Exclude empty comment lines
- Exclude commented-out code

**Code Line Count:**
- Count executable lines (excluding blank lines)

**Comment Ratio:**
- Calculate: (comment lines / code lines) × 100
- Categorize: <10% (Poor), 10-30% (Fair), >30% (Good)

**Documentation Coverage:**
- Count public methods/functions
- Count documented public methods/functions
- Calculate: (documented / total) × 100

### Step 4: Identify Specific Gaps

For each file, list specific missing documentation:

**Critical Gaps (Must Fix):**
- Undocumented public APIs
- Complex algorithms without explanation
- Non-obvious design decisions
- Integration points with Obsidian
- Data transformations

**Important Gaps (Should Fix):**
- Classes without purpose documentation
- Functions with unclear parameters
- Type definitions without context
- Error handling without rationale

**Minor Gaps (Nice to Have):**
- Simple utility functions
- Self-explanatory helper methods
- Standard patterns

### Step 5: Find Complex Sections

Identify code sections that are complex and need explanation:

**Complexity Indicators:**
- Nested logic (>3 levels)
- Long functions (>50 lines)
- Multiple responsibilities
- Non-standard patterns
- Performance optimizations
- Workarounds for bugs or limitations

### Step 6: Catalog TODOs and FIXMEs

Search for and document:
- TODO comments (planned improvements)
- FIXME comments (known issues)
- HACK comments (temporary solutions)
- NOTE comments (important context)

### Step 7: Evaluate External Documentation

Review README and docs/:

**README Assessment:**
- Installation instructions clear?
- Usage examples provided?
- Configuration options documented?
- Contribution guidelines present?
- Architecture overview included?

**docs/ Assessment:**
- Is terminology documented?
- Are workflows explained?
- Is the roadmap clear?
- Are there code examples?

### Step 8: Identify Good Examples

Find well-documented code sections to use as templates:
- Examples of good file headers
- Examples of good class documentation
- Examples of good function documentation
- Examples of good inline comments

## Output File Specification

Create `specs/docs-improvement/3-documentation-audit.md` with the following structure:

```markdown
# Documentation Audit

**Generated:** [Date]  
**Based On:** Project Overview v1.0, Codebase Map v1.0  
**Purpose:** Assess current documentation state and identify gaps

## Executive Summary

### Overall State
[High-level assessment: Good/Fair/Poor with justification]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Priorities
- **Critical:** [Number] gaps requiring immediate attention
- **Important:** [Number] gaps for near-term improvement
- **Minor:** [Number] nice-to-have improvements

## Documentation Metrics

### Overall Statistics
- **Total Source Files:** [Count]
- **Total Lines of Code:** [Count]
- **Total Comment Lines:** [Count]
- **Overall Comment Ratio:** [Percentage]

### Coverage by File Type
- **Files with <10% comments:** [Count and list]
- **Files with 10-30% comments:** [Count and list]
- **Files with >30% comments:** [Count and list]

### API Documentation Coverage
- **Total Public Methods/Functions:** [Count]
- **Documented Public APIs:** [Count]
- **Documentation Coverage:** [Percentage]

## Per-File Assessment

### [File Name 1]

**Path:** `src/[filename]`  
**Lines of Code:** [Count]  
**Comment Lines:** [Count]  
**Comment Ratio:** [Percentage]  
**Quality Rating:** Good / Fair / Poor

**Current State:**
- File header: ✅ Present / ❌ Missing
- Class documentation: ✅ Complete / ⚠️ Partial / ❌ Missing
- Method documentation: [X/Y methods documented]
- Inline comments: ✅ Adequate / ⚠️ Sparse / ❌ Missing

**Specific Gaps:**
1. [Gap 1 - describe what's missing and why it matters]
2. [Gap 2]
3. [Gap 3]

**Complex Sections Needing Explanation:**
- **Lines [X-Y]:** [Description of complex section]
- **Lines [A-B]:** [Description of complex section]

**TODOs/FIXMEs:**
- Line [X]: TODO: [Description]
- Line [Y]: FIXME: [Description]

**Priority:** Critical / Important / Minor

---

[Repeat for each source file]

## Critical Gaps Analysis

### Undocumented Public APIs

List all public methods/functions lacking documentation:

| File | Method/Function | Reason It Needs Documentation |
|------|----------------|------------------------------|
| [file] | [method] | [Why it's important to document] |

### Complex Algorithms

List algorithmic sections lacking explanation:

| File | Lines | Description | Impact |
|------|-------|-------------|--------|
| [file] | [range] | [What the algorithm does] | [Why documentation matters] |

### Integration Points

List Obsidian integration points needing documentation:

| File | Integration | Current State | Needed Documentation |
|------|------------|---------------|---------------------|
| [file] | [API usage] | [Current docs] | [What's missing] |

## README and External Documentation

### README.md Assessment

**Strengths:**
- [Strength 1]
- [Strength 2]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

### docs/ Directory Assessment

**Existing Documentation:**
- `Glossary.md` - [Assessment]
- `Roadmap.md` - [Assessment]

**Missing Documentation:**
- [Missing doc 1]
- [Missing doc 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

## Well-Documented Examples

### Good File Headers
```typescript
// Example from [file]
// [Show example]
```

### Good Class Documentation
```typescript
// Example from [file]
// [Show example]
```

### Good Function Documentation
```typescript
// Example from [file]
// [Show example]
```

### Good Inline Comments
```typescript
// Example from [file]
// [Show example]
```

## TODO and FIXME Inventory

### High Priority
- [ ] [File:Line] - [Description]
- [ ] [File:Line] - [Description]

### Medium Priority
- [ ] [File:Line] - [Description]
- [ ] [File:Line] - [Description]

### Low Priority
- [ ] [File:Line] - [Description]

## Recommendations

### Immediate Actions (Critical)
1. [Action 1 - what to do and why]
2. [Action 2]
3. [Action 3]

### Short-Term Actions (Important)
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Long-Term Actions (Nice to Have)
1. [Action 1]
2. [Action 2]

## Next Steps

The following aspects need to be defined in subsequent workflows:
- Documentation standards specific to this project
- Prioritized improvement plan with concrete tasks
```

## Quality Checkpoints

Before proceeding to the next workflow, verify:

- [ ] All source files have been audited
- [ ] Metrics are accurate and comprehensive
- [ ] Gaps are specific and actionable
- [ ] Complex sections are identified with line numbers
- [ ] TODOs/FIXMEs are inventoried
- [ ] Good examples are documented for reference
- [ ] External documentation is assessed
- [ ] Recommendations are prioritized and concrete
- [ ] The audit provides clear direction for improvement
- [ ] Critical gaps are clearly distinguished from minor issues

## Common Pitfalls

**Avoid:**
- Treating all documentation gaps equally
- Being overly critical of working code
- Ignoring existing good documentation
- Focusing on quantity over quality
- Missing Obsidian-specific patterns
- Overlooking user-facing documentation

**Instead:**
- Prioritize based on user impact and complexity
- Acknowledge and learn from well-documented code
- Identify and preserve good documentation patterns
- Focus on meaningful, helpful documentation
- Highlight plugin-specific integration documentation needs
- Consider both developer and user perspectives

## Next Workflow

After completing this workflow and reviewing the output, proceed to:

**Workflow 4: Documentation Standards** (`.clinerules/workflows/docs-04-documentation-standards.md`)

This workflow will define project-specific guidelines for what good documentation looks like, building on the good examples found in this audit.

## Usage Example

To execute this workflow, use an explicit instruction like:

```
Please execute the Documentation Audit workflow defined in .clinerules/workflows/docs-03-documentation-audit.md
```

Cline will:
1. Review previous workflow outputs for context
2. Analyze each source file for documentation coverage
3. Calculate metrics and identify gaps
4. Catalog TODOs and complex sections
5. Assess external documentation
6. Create comprehensive audit report
7. Commit the result following git standards
