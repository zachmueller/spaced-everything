# Implement Workflow

Execute the implementation plan by processing and executing all tasks defined in tasks.md

## Description
This workflow systematically executes implementation tasks with built-in quality gates, progress tracking, and validation checkpoints. It handles phase-by-phase execution, dependency management, and ensures constitutional compliance throughout implementation.

## Usage
Run this workflow to:
- Execute implementation tasks in proper sequence
- Validate quality gates and checkpoints
- Track progress and handle task dependencies
- Ensure constitutional compliance throughout implementation
- Manage parallel and sequential task execution

## Workflow Steps

### Step 1: Prerequisites and Setup Validation
Validate environment and readiness for implementation:

**Commands to run:**
```bash
# Check current feature branch
git branch --show-current

# Verify required files exist
ls specs/*/tasks.md
ls specs/*/plan.md
ls specs/*/spec.md

# Check git repository status
git status --porcelain
```

Ensure all prerequisite artifacts are complete and environment is ready.

### Step 2: Checklist Status Validation
Check completion status of all quality checklists before proceeding:

**Checklist Scanning Process:**
```bash
# Scan for checklist files
ls specs/*/checklists/

# Check each checklist for completion status
# Count total vs completed items for each checklist
```

**Status Analysis:**
For each checklist file, count:
- **Total items:** All lines matching `- [ ]` or `- [X]` or `- [x]`
- **Completed items:** Lines matching `- [X]` or `- [x]`
- **Incomplete items:** Lines matching `- [ ]`

**Create Status Table:**
```
| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
| ux.md     | 12    | 12        | 0          | ✓ PASS |
| api.md    | 8     | 5         | 3          | ✗ FAIL |
| security.md| 6    | 6         | 0          | ✓ PASS |
```

**Gate Decision:**
- **PASS:** All checklists have 0 incomplete items → Proceed automatically
- **FAIL:** One or more checklists have incomplete items → Stop and ask user

**If FAIL:**
Display incomplete checklist table and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
- Wait for user response before continuing
- If "no"/"wait"/"stop" → Halt execution with guidance to complete checklists
- If "yes"/"proceed"/"continue" → Continue to Step 3 with warning logged

### Step 3: Load Implementation Context
Load and analyze all implementation artifacts:

**Required Artifacts:**
- **tasks.md:** Complete task list and execution plan
- **plan.md:** Tech stack, architecture, and file structure  
- **spec.md:** Requirements and acceptance criteria

**Optional Artifacts:**
- **data-model.md:** Entity definitions and relationships
- **contracts/:** API specifications and test requirements
- **research.md:** Technical decisions and constraints
- **quickstart.md:** Development environment setup

**Context Extraction:**
- Parse task breakdown structure and dependencies
- Extract technology stack and architecture decisions
- Identify file paths and component relationships
- Load constitutional principles for compliance validation

### Step 4: Project Setup Verification
Verify and create essential project files based on detected setup:

**Technology Detection:**
```bash
# Check if git repository
git rev-parse --git-dir

# Detect technology stack from plan.md and existing files
# Check for package.json, requirements.txt, pom.xml, etc.
# Scan for Docker, ESLint, Prettier configurations
```

**Ignore File Management:**
Based on detected technologies, create or verify ignore files:

**Git Repository (.gitignore):**
- **Node.js/JavaScript/TypeScript:** `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
- **Python:** `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
- **Java:** `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
- **C#/.NET:** `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
- **Universal:** `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

**Additional Ignore Files (if applicable):**
- **.dockerignore:** If Dockerfile exists or Docker mentioned in plan
- **.eslintignore:** If ESLint configuration detected
- **.prettierignore:** If Prettier configuration exists
- **.npmignore:** If package.json exists and publishing planned

**Creation Logic:**
- If ignore file exists: Verify essential patterns, append missing critical patterns only
- If ignore file missing: Create with full pattern set for detected technology
- Preserve existing custom patterns while adding standard ones

### Step 5: Parse Task Structure and Dependencies
Analyze tasks.md for execution planning:

**Task Structure Extraction:**
- **Task Phases:** Setup, Foundation, Core, Integration, Quality, Polish
- **Task Dependencies:** Sequential vs parallel execution rules
- **Task Details:** ID, description, file paths, acceptance criteria
- **Parallel Markers:** Tasks marked with `[P]` for concurrent execution

**Dependency Graph Analysis:**
- Build dependency graph from task relationships
- Identify critical path (longest dependency chain)
- Find parallelization opportunities within constraints
- Validate no circular dependencies exist

**Execution Planning:**
- Group tasks by phase for sequential phase execution
- Within phases, identify parallel execution groups
- Plan resource allocation for concurrent tasks
- Prepare validation checkpoints between phases

### Step 6: Phase-by-Phase Implementation Execution
Execute tasks following the structured approach:

**Execution Rules:**
- **Phase Completion:** Complete entire phase before moving to next
- **Dependency Respect:** Sequential tasks run in order, parallel tasks `[P]` can run together
- **TDD Approach:** Execute test setup tasks before implementation tasks where applicable
- **File Coordination:** Tasks affecting same files must run sequentially
- **Validation Checkpoints:** Verify phase completion before proceeding

**Phase Execution Process:**

#### Phase 0: Setup & Environment
Execute environment setup and project initialization:
- Development environment setup
- Dependency installation and configuration
- Project structure initialization
- Build system and tooling configuration

**Validation Checkpoint:**
- Development environment functional
- All tools and dependencies operational
- Project structure matches architecture plan
- Build system working correctly

#### Phase 1: Foundation & Architecture  
Implement core architecture and data foundation:
- Application architecture setup
- Data model implementation
- Database schema creation
- Core infrastructure components

**Validation Checkpoint:**
- Architecture matches plan.md specifications
- Data model supports all requirements
- Database schema functional and validated
- Core infrastructure operational

#### Phase 2: Core Feature Implementation
Implement primary feature functionality:
- Business logic implementation
- Core feature components
- User interface components
- Feature integration and validation

**Validation Checkpoint:**
- Primary user scenarios functional
- Business rules implemented correctly
- UI components meet requirements
- Feature validation successful

#### Phase 3: Integration & External Services
Integrate external services and implement APIs:
- API endpoint implementation
- External service integration
- Data flow validation
- Integration testing

**Validation Checkpoint:**
- API endpoints functional per contracts
- External integrations working
- End-to-end data flow validated
- Integration tests passing

#### Phase 4: Quality & Testing
Implement comprehensive testing and performance validation:
- Unit test implementation
- Integration test suite
- Performance validation and optimization
- Quality assurance verification

**Validation Checkpoint:**
- Test coverage meets standards
- All tests passing
- Performance requirements satisfied
- Quality gates achieved

#### Phase 5: Security & Compliance
Implement security measures and validate compliance:
- Security implementation
- Security testing and validation
- Compliance verification
- Vulnerability assessment

**Validation Checkpoint:**
- Security requirements implemented
- Security testing passed
- Compliance requirements satisfied
- No critical vulnerabilities found

#### Phase 6: Documentation & Deployment
Finalize documentation and prepare deployment:
- Technical documentation
- Deployment preparation
- Final end-to-end validation
- Production readiness verification

**Validation Checkpoint:**
- Documentation complete and accurate
- Deployment pipeline functional
- Final validation successful
- Production readiness confirmed

### Step 7: Task Execution Management
Handle individual task execution with proper tracking:

**Task Execution Process:**
1. **Pre-Task Validation:** Verify dependencies satisfied
2. **Task Execution:** Execute task following acceptance criteria
3. **Progress Tracking:** Mark task as completed in tasks.md
4. **Validation:** Verify acceptance criteria satisfied
5. **Error Handling:** Handle failures and dependencies

**Progress Tracking:**
- Update tasks.md with completed tasks marked as `[X]`
- Log completion timestamp and validation results
- Track overall progress and phase completion
- Report blocking issues and dependency problems

**Error Handling:**
- **Non-Parallel Task Failure:** Halt execution, report error with context
- **Parallel Task Failure:** Continue with successful tasks, report failed ones
- **Dependency Failure:** Block dependent tasks, suggest resolution
- **Validation Failure:** Roll back if possible, require manual intervention

### Step 8: Constitutional Compliance Monitoring
Continuously validate constitutional adherence:

**Compliance Validation Process:**
```bash
# Load project constitution
cat .clinerules/memory/constitution.md
```

**Ongoing Validation:**
- Verify implementation decisions align with constitutional principles
- Check that quality gates enforce constitutional requirements
- Ensure coding standards and practices follow governance rules
- Validate that architecture decisions comply with project constitution

**Compliance Reporting:**
- Flag any potential constitutional violations
- Document compliance validation at each phase
- Report deviations and required corrections
- Maintain audit trail of constitutional adherence

### Step 9: Progress Tracking and Reporting
Provide comprehensive progress tracking throughout implementation:

**Progress Metrics:**
- **Phase Completion:** Current phase and overall progress percentage
- **Task Completion:** Completed tasks vs total tasks
- **Quality Gates:** Passed/failed validation checkpoints  
- **Constitutional Compliance:** Adherence to project governance
- **Blocking Issues:** Unresolved dependencies or failures

**Progress Reporting Format:**
```
Implementation Progress Report
=============================
Feature: [Feature Name]
Branch: [Branch Name]

Phase Progress:
✓ Setup & Environment (100%)
✓ Foundation & Architecture (100%)  
→ Core Feature Implementation (60%)
  - Integration & External Services (0%)
  - Quality & Testing (0%)  
  - Security & Compliance (0%)
  - Documentation & Deployment (0%)

Overall Progress: 32% (18/56 tasks completed)

Current Status:
- Active Phase: Core Feature Implementation
- Blocking Issues: None
- Next Milestone: UI component completion
- Estimated Completion: [Date]

Constitutional Compliance: ✓ PASS
Quality Gates: ✓ PASS
Test Coverage: 85%
```

**Continuous Reporting:**
- Report progress after each completed task
- Generate phase completion summaries
- Provide milestone achievement notifications
- Alert on blocking issues or quality gate failures

### Step 10: Implementation Completion Validation
Final validation and completion verification:

**Completion Validation Checklist:**
- [ ] All tasks marked as completed `[X]` in tasks.md
- [ ] All phase validation checkpoints passed
- [ ] Constitutional compliance maintained throughout
- [ ] Quality gates satisfied at all levels
- [ ] Final end-to-end validation successful

**Feature Validation Against Original Specification:**
- [ ] All functional requirements implemented and validated
- [ ] All non-functional requirements satisfied  
- [ ] User scenarios work end-to-end as specified
- [ ] Success criteria from spec.md achieved
- [ ] Edge cases and error scenarios handled correctly

**Final Documentation and Handoff:**
```bash
# Final commit with completion summary
git add .
git commit -m "feat: complete implementation of [feature-name]

✓ All 56 tasks completed across 6 phases
✓ Constitutional compliance maintained  
✓ Quality gates passed at all checkpoints
✓ Final validation successful against specification

Ready for: deployment, testing, review"

# Create completion report
```

**Completion Report:**
- Implementation summary with metrics
- Quality validation results
- Constitutional compliance verification
- Deployment readiness assessment
- Post-implementation recommendations

## Quality Guidelines

### Task Execution Best Practices
**Systematic Approach:**
- Execute tasks in dependency order
- Validate acceptance criteria before marking complete
- Maintain clean commit history with meaningful messages
- Document any deviations from original plan

**Quality Assurance:**
- Run validation at each phase completion
- Maintain test coverage throughout implementation
- Verify constitutional compliance continuously
- Address quality gate failures immediately

**Error Recovery:**
- Implement graceful error handling
- Provide clear error messages with resolution guidance
- Maintain rollback capabilities where possible
- Document lessons learned from failures

### Progress Management
**Transparent Tracking:**
- Provide regular progress updates
- Report blocking issues immediately
- Maintain accurate task completion status
- Document significant implementation decisions

**Stakeholder Communication:**
- Generate clear progress reports
- Highlight milestone achievements
- Flag risks and dependencies early
- Provide realistic completion estimates

## Dependencies
- Completed task breakdown (`tasks` workflow)
- Implementation plan with technical architecture
- Quality checklists (recommended but not required)
- Project constitution for compliance validation

## Outputs
- Fully implemented feature according to specification
- Updated tasks.md with all tasks marked complete
- Implementation progress reports and validation results
- Constitutional compliance documentation
- Deployment-ready codebase

## Next Steps
After running this workflow:
- Run `analyze` workflow for cross-artifact consistency validation
- Prepare for deployment using deployment guides
- Conduct final user acceptance testing
- Merge feature branch following project governance
- Document lessons learned and process improvements

## Error Handling Scenarios

### Common Issues and Resolutions

**Missing Dependencies:**
- Check if all required tools and libraries are installed
- Verify environment setup matches quickstart.md requirements
- Validate network access for external dependencies

**Constitutional Violations:**
- Review project constitution for compliance requirements
- Update implementation to align with governance principles
- Document any necessary constitution amendments

**Quality Gate Failures:**
- Review quality standards and acceptance criteria
- Implement necessary fixes to meet quality requirements
- Re-run validation to confirm quality gate passage

**Task Dependency Issues:**
- Analyze dependency graph for circular dependencies
- Reorder tasks to resolve dependency conflicts
- Update task breakdown if dependencies change during implementation
