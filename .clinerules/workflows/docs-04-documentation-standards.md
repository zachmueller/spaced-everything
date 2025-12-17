# Workflow: Documentation Standards

**Purpose:** Define project-specific guidelines for what good documentation looks like.

**Status:** Ready for Execution  
**Estimated Time:** 20-30 minutes  
**Output File:** `specs/docs-improvement/4-documentation-standards.md`

## Prerequisites

**Required:** 
- Project Overview workflow must be completed
- Codebase Map workflow must be completed
- Documentation Audit workflow must be completed

**Input Dependencies:** 
- `specs/docs-improvement/1-project-overview.md` - Project context
- `specs/docs-improvement/2-codebase-map.md` - Code architecture
- `specs/docs-improvement/3-documentation-audit.md` - Current state and good examples

## Input Files and Data Sources

- `specs/docs-improvement/3-documentation-audit.md` - Good examples and patterns
- Well-documented files from `src/` (identified in audit)
- TypeScript/JSDoc best practices
- Obsidian plugin documentation conventions

## Execution Instructions

### Step 1: Review Documentation Audit

Read the audit to understand current state and good examples:

```
<read_file>
<path>specs/docs-improvement/3-documentation-audit.md</path>
</read_file>
```

Focus on the "Well-Documented Examples" section to extract patterns.

### Step 2: Analyze Good Examples

For each well-documented section identified in the audit:
- What makes it good?
- What patterns are being followed?
- What level of detail is appropriate?
- How does it explain "why" not just "what"?

### Step 3: Review Best Practice Resources

Consider industry standards:
- **JSDoc conventions** for TypeScript
- **TSDoc** recommendations
- **Obsidian plugin** documentation patterns
- **Clean Code** documentation principles

### Step 4: Define General Principles

Establish overarching documentation philosophy:

**Purpose of Documentation:**
- Help future developers understand the code
- Explain non-obvious decisions
- Provide context for complex logic
- Document integration points
- Support onboarding

**When to Document:**
- Public APIs (always)
- Complex algorithms (always)
- Non-obvious decisions (always)
- Integration points (always)
- Simple, self-explanatory code (rarely)

**Tone and Style:**
- Clear and concise
- Technical but accessible
- Focus on "why" over "what"
- Use complete sentences
- Avoid jargon without explanation

### Step 5: Define File Header Standards

Specify what every file should include:

**Required Elements:**
- File purpose (one-sentence summary)
- Module responsibility (what it does)
- Key exports (if not obvious)
- Dependencies (if unusual or important)

**Optional Elements:**
- Architecture notes
- Performance considerations
- Known limitations
- Related files

### Step 6: Define Class/Interface Standards

Specify documentation for classes and interfaces:

**Class Documentation:**
- Purpose of the class
- Key responsibilities
- Usage examples (if complex)
- Lifecycle (if relevant)
- Thread safety (if relevant)

**Interface Documentation:**
- Purpose of the interface
- When to use it
- Key properties explained
- Example implementations

### Step 7: Define Method/Function Standards

Specify documentation for methods and functions:

**Required for Public Methods:**
- Purpose (what it does and why it exists)
- Parameters (what they mean, not just types)
- Return value (what it represents)
- Side effects (if any)
- Throws/Errors (if any)

**Optional but Recommended:**
- Examples (for complex methods)
- Performance notes (if relevant)
- Thread safety (if relevant)
- Preconditions (if any)
- Postconditions (if any)

### Step 8: Define Inline Comment Standards

Specify when and how to use inline comments:

**When to Use:**
- Explaining complex logic
- Documenting non-obvious decisions
- Noting performance optimizations
- Explaining workarounds
- Marking TODOs/FIXMEs

**When NOT to Use:**
- Restating what code does
- Obvious operations
- Redundant information
- Outdated information

### Step 9: Define Type Documentation Standards

Specify documentation for TypeScript types:

**Type Aliases:**
- What the type represents
- Why it exists
- Example values

**Enums:**
- Purpose of the enum
- Meaning of each value
- When to use each value

**Complex Types:**
- Purpose of the type
- Properties explained
- Usage examples

### Step 10: Create Templates and Examples

Provide concrete templates for:
- File headers
- Class documentation
- Method documentation
- Inline comments
- Type documentation

Include both good and bad examples for comparison.

## Output File Specification

Create `specs/docs-improvement/4-documentation-standards.md` with the following structure:

```markdown
# Documentation Standards

**Generated:** [Date]  
**Based On:** Documentation Audit v1.0  
**Purpose:** Define project-specific documentation guidelines for Spaced Everything

## General Principles

### Purpose of Documentation

Documentation in this project serves to:
1. [Purpose 1]
2. [Purpose 2]
3. [Purpose 3]

### When to Document

**Always Document:**
- Public APIs and methods
- Complex algorithms or business logic
- Non-obvious design decisions
- Integration points with Obsidian
- Data transformations

**Consider Documenting:**
- Private methods with complex logic
- Helper functions with non-obvious behavior
- Configuration or setup code

**Rarely Document:**
- Simple getters/setters
- Self-explanatory utility functions
- Standard patterns (unless project-specific)

### Documentation Philosophy

**Focus on WHY, not WHAT:**
- ✅ "Queue frontmatter updates to avoid race conditions with rapid file changes"
- ❌ "Updates the queue"

**Provide Context:**
- ✅ "Uses debouncing because Obsidian fires multiple events for a single save"
- ❌ "Debounces the function"

**Be Concise but Complete:**
- Include enough detail to understand without reading implementation
- Don't explain every line—trust readers to understand code
- Explain the approach, not the syntax

## File Header Standards

### Required Format

Every source file should begin with:

```typescript
/**
 * [File Name] - [One-sentence purpose]
 * 
 * [Optional: Additional context explaining why this file exists
 * and what problem it solves]
 * 
 * Key exports: [If not obvious from filename]
 * Dependencies: [If unusual or important to understand]
 */
```

### Example

```typescript
/**
 * FrontmatterQueue - Manages queued updates to note frontmatter
 * 
 * Obsidian fires multiple save events when a user edits a file,
 * which can cause race conditions if we update frontmatter immediately.
 * This queue batches updates and applies them with debouncing to
 * ensure data integrity.
 * 
 * Key exports: FrontmatterQueue class
 * Dependencies: Obsidian Vault API for file operations
 */
```

### Anti-Pattern

```typescript
// This file has the frontmatter queue
// It exports the FrontmatterQueue class
```

**Why this is bad:** Doesn't explain purpose, why it exists, or what problem it solves.

## Class and Interface Documentation

### Class Documentation Format

```typescript
/**
 * [ClassName] - [Purpose and responsibility]
 * 
 * [Optional: Detailed explanation of the class's role in the system,
 * how it should be used, and any important lifecycle information]
 * 
 * @example
 * ```typescript
 * const queue = new FrontmatterQueue(vault);
 * await queue.queueUpdate(file, { lastReviewed: Date.now() });
 * ```
 */
class ClassName {
  // ...
}
```

### Interface Documentation Format

```typescript
/**
 * [InterfaceName] - [What this interface represents]
 * 
 * [Optional: When to use this interface, what it models,
 * and any important constraints or relationships]
 */
interface InterfaceName {
  /**
   * [Property description - what it represents and why it exists]
   */
  propertyName: type;
}
```

### Example

```typescript
/**
 * SpacedRepetitionSettings - Configuration for spaced repetition behavior
 * 
 * These settings control how notes are scheduled for review using
 * spaced repetition algorithms. They are persisted in Obsidian's
 * plugin data storage.
 */
interface SpacedRepetitionSettings {
  /**
   * Minimum interval between reviews in days
   * Default: 1 (review at least once per day)
   */
  minInterval: number;
  
  /**
   * Maximum interval between reviews in days
   * Default: 365 (review at least once per year)
   */
  maxInterval: number;
}
```

## Method and Function Documentation

### Method Documentation Format

```typescript
/**
 * [One-sentence description of what the method does and why]
 * 
 * [Optional: Additional context, side effects, or important details]
 * 
 * @param paramName - [What this parameter represents, not just the type]
 * @param anotherParam - [Description]
 * @returns [What the return value represents]
 * @throws {ErrorType} [When and why this error is thrown]
 */
async methodName(paramName: Type, anotherParam: Type): ReturnType {
  // ...
}
```

### Example

```typescript
/**
 * Queue a frontmatter update for a specific file
 * 
 * Updates are not applied immediately to avoid race conditions with
 * Obsidian's file save events. Instead, they're queued and applied
 * after a debounce period.
 * 
 * @param file - The note file to update
 * @param updates - Frontmatter properties to add or modify
 * @returns Promise that resolves when the update is queued (not applied)
 */
async queueUpdate(file: TFile, updates: Partial<FrontmatterData>): Promise<void> {
  // ...
}
```

### Anti-Pattern

```typescript
/**
 * Queue update
 * @param file - file
 * @param updates - updates
 */
async queueUpdate(file: TFile, updates: Partial<FrontmatterData>): Promise<void> {
  // ...
}
```

**Why this is bad:** Restates the method name without explaining purpose, doesn't explain what queuing means, parameter descriptions are useless.

## Inline Comment Standards

### When to Use Inline Comments

**Good Reasons:**
- Explaining complex logic: "Using binary search because array is pre-sorted"
- Non-obvious decisions: "Checking parent folders because Obsidian doesn't normalize paths"
- Performance: "Caching this lookup to avoid O(n²) behavior"
- Workarounds: "Manual delay needed because Obsidian API doesn't await vault updates"
- Algorithms: "SM-2 algorithm: adjust interval based on recall quality"

### Inline Comment Format

```typescript
// [Complete sentence explaining why, not what]
// [Continue explanation if needed]
const result = complexOperation();

// Or for longer explanations:
/*
 * [Explanation of complex section]
 * [Additional context]
 * [Why this approach was chosen]
 */
```

### Examples

**Good:**
```typescript
// Queue is processed in requestAnimationFrame to batch multiple rapid updates
// that occur during user typing, preventing UI jank from frequent file writes
this.processQueue();
```

**Bad:**
```typescript
// Process the queue
this.processQueue();
```

### TODO/FIXME Format

```typescript
// TODO: Add support for custom spacing algorithms
// Context: Current implementation only supports SM-2

// FIXME: Race condition when vault renames happen during queue processing
// Occurs rarely but can lose frontmatter updates
```

## Type Documentation Standards

### Type Alias Documentation

```typescript
/**
 * [What this type represents]
 * 
 * [Optional: Why this type exists, usage examples]
 */
type TypeName = [definition];
```

### Enum Documentation

```typescript
/**
 * [What this enum represents]
 */
enum EnumName {
  /**
   * [What this value means and when to use it]
   */
  VALUE_ONE = 'value1',
  
  /**
   * [What this value means and when to use it]
   */
  VALUE_TWO = 'value2',
}
```

### Example

```typescript
/**
 * Context types for notes in the vault
 * 
 * Contexts allow users to group notes for separate review schedules.
 * For example, language learning notes might be reviewed daily while
 * reference notes are reviewed monthly.
 */
type NoteContext = 'default' | 'learning' | 'reference' | 'archive';

/**
 * Review quality ratings for spaced repetition
 */
enum ReviewQuality {
  /**
   * Complete blackout - no recall at all
   * Resets interval to minimum
   */
  NONE = 0,
  
  /**
   * Incorrect response but recognized when shown
   * Reduces interval significantly
   */
  HARD = 1,
  
  /**
   * Correct response with serious difficulty
   * Maintains or slightly increases interval
   */
  GOOD = 2,
  
  /**
   * Perfect response with no difficulty
   * Increases interval significantly
   */
  EASY = 3,
}
```

## Documentation Templates

### File Header Template

```typescript
/**
 * [FileName] - [One-sentence purpose]
 * 
 * [2-3 sentences explaining why this file exists, what problem it solves,
 * and how it fits into the larger system]
 * 
 * Key exports: [List main exports if not obvious]
 * Dependencies: [Note unusual or important dependencies]
 */
```

### Class Template

```typescript
/**
 * [ClassName] - [Purpose and responsibility]
 * 
 * [Detailed explanation of role, usage, and lifecycle]
 * 
 * @example
 * ```typescript
 * // Show typical usage
 * ```
 */
export class ClassName {
  /**
   * [Constructor purpose]
   * @param param - [What it configures]
   */
  constructor(param: Type) {}
  
  /**
   * [Method purpose and why it exists]
   * @param param - [What it represents]
   * @returns [What result represents]
   */
  public method(param: Type): ReturnType {}
}
```

### Function Template

```typescript
/**
 * [What the function does and why it exists]
 * 
 * [Optional: Additional context or important details]
 * 
 * @param param - [What it represents, not just type]
 * @returns [What the result represents]
 */
export function functionName(param: Type): ReturnType {
  // ...
}
```

## Anti-Patterns to Avoid

### Useless Comments

❌ **Bad:**
```typescript
// Increment counter
counter++;

// Call the function
doSomething();

// Return the value
return value;
```

✅ **Better:** No comment needed—code is self-explanatory

### Commenting What Instead of Why

❌ **Bad:**
```typescript
// Set last reviewed to current time
note.frontmatter.lastReviewed = Date.now();
```

✅ **Better:**
```typescript
// Track review time to calculate next interval using SM-2 algorithm
note.frontmatter.lastReviewed = Date.now();
```

### Outdated Comments

❌ **Bad:**
```typescript
// Process all files in the vault
// [Code has changed but comment hasn't been updated]
await this.processRecentFiles(limit);
```

✅ **Better:** Keep comments synchronized with code changes

### Redundant JSDoc

❌ **Bad:**
```typescript
/**
 * Get the file
 * @param path - the path
 * @returns the file
 */
getFile(path: string): TFile
```

✅ **Better:**
```typescript
/**
 * Resolve a file path to a TFile object, returning null if the file
 * doesn't exist or is not a markdown file
 * 
 * @param path - Vault-relative path (e.g., 'folder/note.md')
 * @returns File object or null
 */
getFile(path: string): TFile | null
```

## Quality Checklist

Before considering documentation complete, verify:

- [ ] File headers explain purpose and context
- [ ] Public APIs have complete documentation
- [ ] Complex sections have explanatory comments
- [ ] Comments explain "why" not "what"
- [ ] Examples are provided where helpful
- [ ] No redundant or useless comments
- [ ] No outdated comments
- [ ] Obsidian integration points are documented
- [ ] Type definitions are explained
- [ ] TODOs/FIXMEs include context

## Next Steps

These standards will be used in subsequent workflows:
- Creating the improvement plan (prioritizing what to document)
- Implementing documentation improvements (following these standards)
```

## Quality Checkpoints

Before proceeding to the next workflow, verify:

- [ ] Standards are clear and actionable
- [ ] Examples demonstrate the principles
- [ ] Anti-patterns are identified and explained
- [ ] Templates are complete and reusable
- [ ] Standards are project-specific, not just generic advice
- [ ] Good examples from audit are incorporated
- [ ] Standards address Obsidian plugin specifics
- [ ] The document will guide consistent documentation

## Common Pitfalls

**Avoid:**
- Creating overly prescriptive standards that stifle clarity
- Copying generic documentation guidelines without customization
- Requiring documentation for self-explanatory code
- Ignoring the project's specific context (Obsidian plugins)
- Making standards so complex they won't be followed

**Instead:**
- Focus on principles over rigid rules
- Customize standards based on project needs
- Prioritize meaningful documentation over comprehensive coverage
- Include plugin-specific guidance
- Keep standards practical and achievable

## Next Workflow

After completing this workflow and reviewing the output, proceed to:

**Workflow 5: Improvement Plan** (`.clinerules/workflows/docs-05-improvement-plan.md`)

This workflow will create a prioritized plan for applying these standards to improve the codebase documentation.

## Usage Example

To execute this workflow, use an explicit instruction like:

```
Please execute the Documentation Standards workflow defined in .clinerules/workflows/docs-04-documentation-standards.md
```

Cline will:
1. Review documentation audit for good examples
2. Analyze patterns in well-documented code
3. Define project-specific standards
4. Create templates and examples
5. Document anti-patterns to avoid
6. Create comprehensive standards document
7. Commit the result following git standards
