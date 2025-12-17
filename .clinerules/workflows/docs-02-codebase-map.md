# Workflow: Codebase Map

**Purpose:** Create a detailed map of all source files, their responsibilities, and relationships.

**Status:** Ready for Execution  
**Estimated Time:** 20-30 minutes  
**Output File:** `specs/docs-improvement/2-codebase-map.md`

## Prerequisites

**Required:** Project Overview workflow must be completed first.

**Input Dependency:** 
- `specs/docs-improvement/1-project-overview.md` - Provides high-level context for understanding code organization

## Input Files and Data Sources

- All files in `src/` directory
- `specs/docs-improvement/1-project-overview.md` - Project context
- `package.json` - Understanding dependencies
- `tsconfig.json` - Understanding TypeScript configuration

## Execution Instructions

### Step 1: List All Source Files

Use the list_code_definition_names tool to get an overview:

```
<list_code_definition_names>
<path>src</path>
</list_code_definition_names>
```

This provides a quick inventory of all modules and their exports.

### Step 2: Read Each Source File

For each file in `src/`, read and analyze:

```
<read_file>
<path>src/[filename]</path>
</read_file>
```

### Step 3: Analyze Per-File Details

For each file, document:

**Primary Purpose:**
- What is this file's main responsibility?
- Why does this file exist?
- What problem does it solve?

**Key Exports:**
- Classes: Name, purpose, key methods
- Functions: Name, purpose, signature
- Types/Interfaces: Name, purpose, properties
- Constants: Name, purpose, value

**Dependencies (Imports):**
- Internal imports (from other src/ files)
- External imports (from npm packages)
- Obsidian API imports

**Dependents:**
- Which other files import from this file?
- What do they use it for?

**Code Patterns:**
- Design patterns used (singleton, factory, observer, etc.)
- TypeScript features leveraged (generics, decorators, etc.)
- Architectural conventions followed

### Step 4: Map Dependencies

Create a dependency graph showing:
- Which files import which other files
- Direction of dependencies (A → B means "A imports from B")
- Circular dependencies (if any)
- Core vs. peripheral modules

### Step 5: Identify Architectural Patterns

Look for:
- **Separation of concerns:** How are responsibilities divided?
- **Layering:** Are there clear layers (UI, business logic, data)?
- **Entry points:** Where does execution begin?
- **Plugin lifecycle:** How does the plugin initialize and shut down?
- **Event handling:** How are Obsidian events handled?
- **State management:** Where and how is state stored?

### Step 6: Document Data Flow

Trace how data moves through the system:
- User input → Processing → Storage
- File changes → Detection → Update
- Settings changes → Propagation → Effect
- Plugin load → Initialization → Ready state

### Step 7: Identify Conventions

Document consistent patterns:
- File naming conventions
- Class naming patterns
- Function organization
- Import ordering
- Error handling approaches
- Type usage patterns

## Output File Specification

Create `specs/docs-improvement/2-codebase-map.md` with the following structure:

```markdown
# Codebase Map

**Generated:** [Date]  
**Based On:** Project Overview v1.0  
**Purpose:** Detailed mapping of source code structure and relationships

## File Inventory

Quick reference list of all source files:

| File | Primary Responsibility | Key Exports |
|------|----------------------|-------------|
| main.ts | [Purpose] | [Classes/Functions] |
| settings.ts | [Purpose] | [Classes/Functions] |
| ... | ... | ... |

## Module Details

### [File Name 1]

**Path:** `src/[filename]`  
**Purpose:** [Detailed explanation of why this file exists]

**Responsibility:** [What this file is responsible for]

**Key Exports:**
- **[ClassName]** - [Purpose and key methods]
- **[FunctionName]** - [Purpose and signature]
- **[TypeName]** - [Purpose and structure]

**Dependencies:**
- **Internal:**
  - `[file]` - [What is imported and why]
- **External:**
  - `[package]` - [What is used and why]
- **Obsidian API:**
  - `[API]` - [What functionality is leveraged]

**Dependents:**
- `[file1]` - [What it uses from this module]
- `[file2]` - [What it uses from this module]

**Code Patterns:**
- [Pattern 1 and how it's used]
- [Pattern 2 and how it's used]

**Notable Implementation Details:**
- [Any important details about implementation]

---

[Repeat for each source file]

## Dependency Graph

```
main.ts
├── settings.ts
├── logger.ts
├── frontmatterQueue.ts
│   └── types.ts
├── suggester.ts
│   └── types.ts
└── types.ts

settings.ts
└── types.ts

logger.ts
[No dependencies]

[etc.]
```

**Dependency Analysis:**
- **Core modules:** [Files that many others depend on]
- **Entry points:** [Files that initiate execution]
- **Leaf modules:** [Files with no dependents]
- **Circular dependencies:** [If any, document them]

## Architectural Patterns

### Overall Architecture
[Describe the high-level architectural pattern: MVC, MVP, Plugin architecture, etc.]

### Separation of Concerns
- **UI Layer:** [Files handling user interface]
- **Business Logic:** [Files handling core functionality]
- **Data Layer:** [Files handling data access/storage]
- **Integration Layer:** [Files interfacing with Obsidian]

### Design Patterns Identified
1. **[Pattern Name]**
   - **Used In:** [Files]
   - **Purpose:** [Why this pattern is used]
   - **Implementation:** [How it's implemented]

2. **[Pattern Name]**
   - [Details]

### Plugin Lifecycle
1. **Load:** [What happens when plugin loads]
2. **Initialize:** [Initialization sequence]
3. **Ready:** [When plugin is ready for use]
4. **Unload:** [Cleanup on plugin unload]

## Data Flow

### User Interactions
```
User Action
  ↓
[File handling action]
  ↓
[Processing logic]
  ↓
[State update]
  ↓
[UI update or file write]
```

### File Processing
[Document how files are read, processed, and updated]

### Settings Management
[Document how settings are loaded, changed, and persisted]

### Spaced Repetition Flow
[Document how the spaced repetition algorithm is applied]

## Code Conventions

### File Organization
- [Convention 1]
- [Convention 2]

### Naming Conventions
- **Classes:** [Pattern]
- **Functions:** [Pattern]
- **Variables:** [Pattern]
- **Types/Interfaces:** [Pattern]

### Import Conventions
- [How imports are organized]
- [Ordering patterns]

### Error Handling
- [How errors are handled]
- [Logging patterns]

### Type Usage
- [When types vs. interfaces are used]
- [Generic usage patterns]

## Key Insights

### Strengths
- [Well-organized aspect 1]
- [Well-organized aspect 2]

### Areas of Complexity
- [Complex area 1 and why]
- [Complex area 2 and why]

### Potential Refactoring Opportunities
- [Opportunity 1]
- [Opportunity 2]

## Notes for Documentation

Based on this codebase map, the following areas will need thorough documentation:
1. [Complex area needing explanation]
2. [Non-obvious design decision]
3. [Integration point with Obsidian]

## Next Steps

The following aspects need deeper exploration in subsequent workflows:
- Current state of documentation (Documentation Audit workflow)
- Specific documentation standards for this codebase
```

## Quality Checkpoints

Before proceeding to the next workflow, verify:

- [ ] All source files have been read and analyzed
- [ ] Each file's purpose is clearly articulated
- [ ] Dependencies are accurately mapped
- [ ] Dependency graph is complete and correct
- [ ] Architectural patterns are identified and explained
- [ ] Data flow is traceable and clear
- [ ] Code conventions are documented
- [ ] Output provides actionable insights for documentation
- [ ] No files were overlooked
- [ ] Relationships between files are accurately captured

## Common Pitfalls

**Avoid:**
- Listing exports without explaining their purpose
- Missing implicit dependencies (type-only imports)
- Overlooking Obsidian API usage patterns
- Treating all files as equally important
- Creating incomplete dependency graphs
- Documenting "what" without "why"

**Instead:**
- Explain why each module exists and what problem it solves
- Document all dependency types (runtime, type-only, dev)
- Highlight Obsidian-specific integration patterns
- Identify core vs. supporting modules
- Create comprehensive, accurate dependency visualization
- Focus on understanding architectural decisions

## Next Workflow

After completing this workflow and reviewing the output, proceed to:

**Workflow 3: Documentation Audit** (`.clinerules/workflows/docs-03-documentation-audit.md`)

This workflow will assess the current state of documentation in the codebase and identify specific gaps.

## Usage Example

To execute this workflow, use an explicit instruction like:

```
Please execute the Codebase Map workflow defined in .clinerules/workflows/docs-02-codebase-map.md
```

Cline will:
1. List all source files and their definitions
2. Read and analyze each file in detail
3. Map dependencies and relationships
4. Identify architectural patterns
5. Create comprehensive codebase map
6. Commit the result following git standards
