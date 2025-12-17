# Tasks Workflow

Generate detailed task breakdown from implementation plan and specification.

## Description
This workflow creates comprehensive task lists that break down implementation plans into actionable, sequenced tasks. It handles dependency management, parallel execution planning, and creates the foundation for systematic implementation.

## Usage
Run this workflow to:
- Break down implementation plans into specific tasks
- Organize tasks by phases and dependencies
- Identify parallel vs sequential execution requirements
- Create detailed task descriptions with file paths and acceptance criteria
- Prepare for systematic implementation execution

## Workflow Steps

### Step 1: Setup and Prerequisites Validation
Load implementation context and validate readiness for task breakdown:

**Commands to run:**
```bash
# Check current feature branch
git branch --show-current

# Verify implementation plan exists
ls specs/*/plan.md

# Check for existing task file
ls specs/*/tasks.md

# Load specification for requirements context
cat specs/*/spec.md

# Load implementation plan for technical context
cat specs/*/plan.md
```

Validate that implementation plan is complete and ready for task breakdown.

### Step 2: Load Implementation Context
Extract key information from implementation artifacts:

**From Implementation Plan (`plan.md`):**
- Architecture and technology stack decisions
- Data model references and entity relationships
- API contract specifications
- Technical constraints and requirements
- Phase breakdown and dependencies

**From Specification (`spec.md`):**
- Functional requirements and acceptance criteria
- User scenarios and edge cases
- Non-functional requirements
- Success criteria and validation points

**From Additional Artifacts (if present):**
- `data-model.md`: Entity definitions and relationships
- `contracts/`: API specifications and test requirements
- `research.md`: Technical decisions and constraints
- `quickstart.md`: Development environment and setup requirements

### Step 3: Task Breakdown Structure
Organize tasks into systematic phases with clear dependencies:

**Phase Structure:**
1. **Setup Phase**: Project initialization, dependencies, configuration
2. **Foundation Phase**: Core architecture, data models, basic structure
3. **Core Phase**: Primary feature implementation, business logic
4. **Integration Phase**: External services, API endpoints, data flow
5. **Quality Phase**: Testing, validation, performance optimization
6. **Polish Phase**: Documentation, deployment preparation, final validation

**Task Categorization:**
- **Sequential Tasks**: Must be completed in order (dependencies)
- **Parallel Tasks [P]**: Can be executed simultaneously 
- **Validation Tasks**: Quality gates and checkpoints
- **Documentation Tasks**: Technical and user documentation

### Step 4: Generate Task Template Structure
Create comprehensive task breakdown template:

```markdown
# Task Breakdown: [FEATURE NAME]

**Created:** [DATE]
**Implementation Plan:** [Link to plan.md]
**Specification:** [Link to spec.md]
**Status:** Planning

## Task Summary

**Total Tasks:** [NUMBER]
**Phases:** 6 (Setup → Foundation → Core → Integration → Quality → Polish)
**Estimated Complexity:** [High/Medium/Low]
**Parallel Execution Opportunities:** [NUMBER] task groups

## Phase 0: Setup & Environment

### ENV-001: Development Environment Setup
**Description:** Initialize development environment and tooling
**Files:** `package.json`, `README.md`, development configuration files
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Development environment matches quickstart.md requirements
- [ ] All required tools and dependencies installed
- [ ] Project structure follows architecture plan
- [ ] Version control properly configured

**Commands:**
```bash
# Initialize project structure
# Install dependencies  
# Configure development tools
```

### ENV-002 [P]: Project Configuration
**Description:** Set up build tools, linting, and development workflow
**Files:** Configuration files for build tools, linters, formatters
**Dependencies:** ENV-001
**Acceptance Criteria:**
- [ ] Build system configured per plan.md specifications
- [ ] Code quality tools (linting, formatting) operational
- [ ] Development scripts and commands functional
- [ ] CI/CD pipeline configuration ready

## Phase 1: Foundation & Architecture

### ARCH-001: Core Architecture Setup
**Description:** Implement basic application structure and architecture
**Files:** Main application structure, configuration management
**Dependencies:** ENV-002
**Acceptance Criteria:**
- [ ] Application architecture matches plan.md design
- [ ] Configuration management system implemented
- [ ] Core application structure established
- [ ] Architecture supports planned scalability requirements

### DATA-001: Data Model Implementation
**Description:** Implement core data entities and relationships
**Files:** Entity definitions, data access layer, validation logic
**Dependencies:** ARCH-001
**Acceptance Criteria:**
- [ ] All entities from data-model.md implemented
- [ ] Relationships and constraints properly defined
- [ ] Data validation rules enforced
- [ ] Entity state transitions working correctly

### DATA-002 [P]: Database Schema
**Description:** Create and validate database schema
**Files:** Database migration files, schema definitions
**Dependencies:** DATA-001
**Acceptance Criteria:**
- [ ] Database schema matches data model design
- [ ] All tables, indexes, and constraints created
- [ ] Migration scripts functional and reversible
- [ ] Database initialization automated

## Phase 2: Core Feature Implementation

### FEAT-001: [Primary Feature Component]
**Description:** Implement main feature functionality
**Files:** Core business logic, service layer implementations
**Dependencies:** DATA-002, ARCH-001
**Acceptance Criteria:**
- [ ] Primary user scenarios from spec.md functional
- [ ] Business rules from functional requirements implemented
- [ ] Core feature logic handles happy path scenarios
- [ ] Feature meets performance requirements from plan.md

### FEAT-002 [P]: [Secondary Feature Component]
**Description:** Implement supporting feature functionality
**Files:** Supporting business logic, utility functions
**Dependencies:** FEAT-001
**Acceptance Criteria:**
- [ ] Secondary user scenarios implemented
- [ ] Supporting features integrate with primary features
- [ ] Edge cases from specification handled
- [ ] Feature validation and error handling complete

### UI-001 [P]: User Interface Implementation
**Description:** Implement user interface components and interactions
**Files:** UI components, styling, interaction handlers
**Dependencies:** FEAT-001
**Acceptance Criteria:**
- [ ] User interface matches specification requirements
- [ ] All user scenarios supported by UI
- [ ] Responsive design requirements met
- [ ] Accessibility requirements satisfied

## Phase 3: Integration & External Services

### API-001: API Endpoint Implementation  
**Description:** Implement API endpoints per contract specifications
**Files:** API route handlers, middleware, authentication
**Dependencies:** FEAT-002, UI-001
**Acceptance Criteria:**
- [ ] All endpoints from contracts/ implemented
- [ ] Request/response formats match specifications
- [ ] Authentication and authorization working
- [ ] Error handling follows API design patterns

### INT-001 [P]: External Service Integration
**Description:** Integrate with external services and APIs
**Files:** Service integration layers, error handling, configuration
**Dependencies:** API-001
**Acceptance Criteria:**
- [ ] External service integrations functional
- [ ] Failure modes and recovery handled
- [ ] Service configuration externalized
- [ ] Integration monitoring and logging implemented

### INT-002 [P]: Data Flow Validation
**Description:** Validate end-to-end data flow and processing
**Files:** Integration tests, data validation, workflow verification
**Dependencies:** INT-001
**Acceptance Criteria:**
- [ ] Complete user workflows functional
- [ ] Data integrity maintained throughout system
- [ ] Cross-service communication working
- [ ] Performance meets non-functional requirements

## Phase 4: Quality & Testing

### TEST-001: Unit Test Implementation
**Description:** Implement comprehensive unit test coverage
**Files:** Unit test files, test utilities, mocking infrastructure
**Dependencies:** All FEAT-*, DATA-* tasks
**Acceptance Criteria:**
- [ ] Unit tests cover all business logic
- [ ] Test coverage meets quality standards
- [ ] Tests validate functional requirements
- [ ] Mock external dependencies properly

### TEST-002 [P]: Integration Test Suite
**Description:** Create integration tests for feature workflows
**Files:** Integration test files, test data, test environment setup
**Dependencies:** All API-*, INT-* tasks
**Acceptance Criteria:**
- [ ] Integration tests cover user scenarios
- [ ] End-to-end workflows validated
- [ ] External service integration tested
- [ ] Error and recovery scenarios covered

### PERF-001 [P]: Performance Validation
**Description:** Validate performance requirements and optimize
**Files:** Performance tests, benchmarking, optimization code
**Dependencies:** TEST-002
**Acceptance Criteria:**
- [ ] Performance meets success criteria from spec.md
- [ ] Load testing validates scalability requirements
- [ ] Performance bottlenecks identified and resolved
- [ ] Monitoring and alerting configured

## Phase 5: Security & Compliance

### SEC-001: Security Implementation
**Description:** Implement security measures and validation
**Files:** Authentication, authorization, security middleware
**Dependencies:** All API-* tasks
**Acceptance Criteria:**
- [ ] Security requirements from spec.md implemented
- [ ] Authentication and authorization functional
- [ ] Data protection measures operational
- [ ] Security vulnerabilities addressed

### SEC-002 [P]: Security Validation
**Description:** Validate security implementation and conduct security testing
**Files:** Security tests, penetration testing results, compliance documentation
**Dependencies:** SEC-001
**Acceptance Criteria:**
- [ ] Security testing completed successfully
- [ ] Compliance requirements satisfied
- [ ] Security documentation complete
- [ ] Vulnerability assessment passed

## Phase 6: Documentation & Deployment

### DOC-001: Technical Documentation
**Description:** Create comprehensive technical documentation
**Files:** API documentation, architecture docs, deployment guides
**Dependencies:** All previous phases
**Acceptance Criteria:**
- [ ] API documentation complete and accurate
- [ ] Architecture documentation updated
- [ ] Deployment and operational guides created
- [ ] Developer onboarding documentation ready

### DEPLOY-001 [P]: Deployment Preparation
**Description:** Prepare for production deployment
**Files:** Deployment scripts, configuration management, monitoring setup
**Dependencies:** PERF-001, SEC-002
**Acceptance Criteria:**
- [ ] Deployment pipeline functional
- [ ] Production configuration ready
- [ ] Monitoring and logging operational
- [ ] Rollback procedures documented and tested

### VAL-001: Final Validation
**Description:** Final end-to-end validation against specification
**Files:** Validation test results, acceptance criteria verification
**Dependencies:** DOC-001, DEPLOY-001
**Acceptance Criteria:**
- [ ] All functional requirements satisfied
- [ ] All non-functional requirements met
- [ ] User scenarios work end-to-end
- [ ] Success criteria from spec.md achieved
```

### Step 5: Task Generation Process
Create specific tasks based on implementation plan analysis:

**Task Identification Algorithm:**
1. **Extract Components:** Identify major components from architecture and data model
2. **Map Requirements:** Link each functional requirement to implementation tasks
3. **Identify Dependencies:** Determine task sequencing and dependency chains
4. **Find Parallelization:** Identify tasks that can run simultaneously
5. **Add Quality Gates:** Insert validation and testing tasks at appropriate points
6. **Include Documentation:** Add documentation tasks for each major component

**Task Detailing Process:**
For each identified task:
- **Generate ID:** Use phase prefix + sequential number (e.g., FEAT-001)
- **Write Description:** Clear, actionable task description
- **Identify Files:** Specific files that will be created or modified
- **Map Dependencies:** Tasks that must complete before this task
- **Define Acceptance Criteria:** Specific, measurable completion criteria
- **Add Commands:** Relevant setup or validation commands where applicable

### Step 6: Dependency Analysis and Sequencing
Analyze and optimize task dependencies:

**Dependency Types:**
- **Hard Dependencies:** Task A must complete before Task B can start
- **Soft Dependencies:** Task A should complete before Task B for optimal flow
- **Resource Dependencies:** Tasks that cannot run simultaneously due to shared resources
- **Integration Dependencies:** Tasks that require integration points to be established

**Parallel Execution Identification:**
- Mark tasks with `[P]` that can execute in parallel with others in same phase
- Group related parallel tasks for efficient execution
- Ensure parallel tasks don't have file conflicts or shared resource issues
- Balance parallel execution with system resource constraints

**Critical Path Analysis:**
- Identify longest dependency chain (critical path)
- Optimize task sequencing to minimize total implementation time
- Highlight bottleneck tasks that could delay overall completion
- Suggest parallel alternatives where possible

### Step 7: Validation and Quality Gates
Integrate quality validation throughout task breakdown:

**Phase Gates:**
Each phase should end with validation tasks that ensure:
- Phase objectives completed successfully
- Quality standards maintained
- Dependencies satisfied for next phase
- No regressions introduced

**Acceptance Criteria Validation:**
For each task, ensure acceptance criteria are:
- **Specific:** Clear, unambiguous completion conditions
- **Measurable:** Objective verification possible
- **Achievable:** Realistic given constraints and dependencies
- **Relevant:** Directly supports specification requirements
- **Time-bound:** Can be completed in reasonable timeframe

**Constitutional Compliance:**
- Verify tasks align with project constitution principles
- Include compliance validation in appropriate tasks
- Ensure quality standards maintained throughout implementation

### Step 8: Task File Generation and Validation
Create complete tasks.md file with validation:

**File Structure Validation:**
- All phases represented with appropriate tasks
- Task IDs unique and follow naming convention
- Dependencies properly mapped and achievable
- Parallel execution markers `[P]` used correctly
- Acceptance criteria complete and measurable

**Completeness Check:**
- All functional requirements from spec.md addressed
- All technical components from plan.md covered
- Quality and testing tasks included
- Documentation and deployment tasks present
- Security and compliance requirements addressed

**Cross-Reference Validation:**
- Tasks reference correct files and components
- Dependencies exist and are reachable
- No circular dependencies created
- Critical path identified and optimized

### Step 9: Finalize and Report
Complete task breakdown and prepare for implementation:

**Commands to run:**
```bash
# Add task breakdown file
git add specs/*/tasks.md

# Commit task breakdown
git commit -m "feat: add task breakdown for [feature-name]

- [total-tasks] tasks across 6 implementation phases
- Dependency mapping and parallel execution planning
- Quality gates and validation checkpoints
- Ready for systematic implementation execution"
```

**Completion Report:**
- Task file path and total task count
- Phase breakdown summary
- Parallel execution opportunities
- Critical path analysis
- Estimated implementation complexity
- Readiness for `implement` workflow

## Quality Guidelines

### Effective Task Breakdown
**Task Granularity:**
- Each task should be completable in 1-4 hours of focused work
- Large tasks should be broken down into subtasks
- Atomic tasks that can be independently validated
- Clear deliverables and success criteria

**Dependency Management:**
- Minimize unnecessary dependencies to enable parallelization
- Make dependencies explicit and justify them
- Avoid circular dependencies
- Plan for dependency changes during implementation

**Acceptance Criteria Quality:**
- Each task must have clear completion criteria
- Criteria should be testable and verifiable
- Link to specification requirements where applicable
- Include both functional and quality validation

### Implementation Readiness
**File and Component Planning:**
- Identify specific files that will be created or modified
- Plan component interfaces and integration points
- Consider file organization and architecture consistency
- Plan for configuration and environment-specific files

**Quality Integration:**
- Include testing tasks throughout implementation phases
- Plan for continuous integration and validation
- Include performance and security validation tasks
- Ensure documentation tasks cover all major components

## Dependencies
- Completed implementation plan (`plan` workflow)
- Feature specification for requirements context
- Optional: Data model and API contracts for detailed planning

## Outputs
- `specs/[feature]/tasks.md` - Complete task breakdown
- Phase-organized task structure with dependencies
- Parallel execution planning
- Quality gates and validation checkpoints

## Next Steps
After running this workflow:
- Review task breakdown for completeness and accuracy
- Run `implement` workflow to execute tasks systematically
- Monitor progress and adjust task sequencing as needed
- Validate quality gates throughout implementation
