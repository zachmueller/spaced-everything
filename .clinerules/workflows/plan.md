# Plan Workflow

Execute the implementation planning workflow using the plan template to generate design artifacts.

## Description
This workflow creates comprehensive implementation plans from feature specifications. It handles technical architecture decisions, data modeling, API contract generation, and creates the foundation for task breakdown and implementation.

## Usage
Run this workflow to:
- Generate technical implementation plans from specifications
- Create data models and API contracts
- Perform constitution compliance checks
- Set up research and design artifacts
- Prepare for task breakdown and implementation

## Workflow Steps

### Step 1: Setup and Validation
Load feature context and validate prerequisites:

**Commands to run:**
```bash
# Check current branch
git branch --show-current

# Verify spec exists
ls specs/*/spec.md

# Check for existing plan
ls specs/*/plan.md

# Load constitution for compliance checks
ls .clinerules/memory/constitution.md
```

Parse feature directory structure and validate that specification is complete.

### Step 2: Load Implementation Plan Template
Create or load the implementation plan template structure:

```markdown
# Implementation Plan: [FEATURE NAME]

**Created:** [DATE]
**Specification:** [Link to spec.md]
**Status:** Planning

## Technical Context

### Architecture Decisions
- **Frontend Framework:** [NEEDS CLARIFICATION: React/Vue/Angular/Vanilla]
- **Backend Technology:** [NEEDS CLARIFICATION: Node.js/Python/Java/etc]
- **Database:** [NEEDS CLARIFICATION: PostgreSQL/MySQL/MongoDB/etc]
- **Hosting/Deployment:** [NEEDS CLARIFICATION: Cloud provider and services]
- **Authentication:** [NEEDS CLARIFICATION: Strategy and implementation]

### Technology Stack Rationale
For each technology choice, document:
- **Decision:** What was chosen
- **Rationale:** Why it was chosen  
- **Alternatives Considered:** What else was evaluated
- **Trade-offs:** Pros and cons of the decision

### Integration Points
- External services and APIs
- Third-party libraries and dependencies
- Platform-specific considerations
- Security and compliance requirements

## Constitution Check

Load project constitution and validate plan alignment:

### Principle Compliance Review
For each constitutional principle:
- **Principle:** [Name]
- **Requirement:** [What it mandates]
- **Plan Alignment:** [How this plan complies]
- **Validation:** [How compliance will be verified]

### Quality Gates
- [ ] All constitutional MUST requirements addressed
- [ ] Non-negotiable principles not violated
- [ ] Quality standards and practices followed
- [ ] Compliance requirements satisfied

**Gate Evaluation:** PASS/FAIL - Must be PASS to proceed

## Phase 0: Research & Architecture

### Technology Research Tasks
For each NEEDS CLARIFICATION item above:
- **Research Task:** [Description]
- **Questions to Answer:** [Specific information needed]
- **Success Criteria:** [How to evaluate options]
- **Deadline:** [When decision needed]

### Architecture Investigation
- **Performance Requirements:** [Investigate scaling and performance needs]
- **Security Analysis:** [Research security patterns and requirements]
- **Integration Patterns:** [Evaluate API design and data flow]
- **Deployment Strategy:** [Research hosting and deployment options]

### Research Deliverables
- `research.md` - Consolidated research findings with decisions and rationale
- Technology choice documentation with alternatives considered
- Architecture decision records (ADRs) for major choices

## Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete with all NEEDS CLARIFICATION resolved

### Data Model Design
Extract entities from feature specification and design data layer:

**Entity Analysis:**
- Review functional requirements for data entities
- Identify relationships between entities  
- Define validation rules and constraints
- Model state transitions and lifecycle

**Data Model Deliverables:**
- `data-model.md` - Entity definitions, relationships, validation rules
- Database schema design (tables, indexes, constraints)  
- State transition diagrams where applicable
- Data validation and business rules

### API Contract Generation
Generate API specifications from functional requirements:

**Contract Design Process:**
1. **Extract User Actions:** Each functional requirement → potential endpoint
2. **Apply REST/GraphQL Patterns:** Standard patterns for CRUD operations
3. **Define Request/Response:** Data formats and validation rules
4. **Error Handling:** Standard error codes and messages
5. **Authentication/Authorization:** Security requirements per endpoint

**Contract Deliverables:**
- `contracts/` directory with API specifications
- OpenAPI/Swagger documentation (REST APIs)
- GraphQL schema definitions (GraphQL APIs)
- Authentication and authorization specifications
- Error handling and status code documentation

### Development Environment Setup
- `quickstart.md` - Developer onboarding and setup instructions
- Development environment configuration
- Build and deployment scripts
- Testing framework setup
- CI/CD pipeline configuration

### Agent Context Updates
Update AI assistant context with technology decisions:
- Add new technologies from current plan to assistant context
- Preserve existing manual additions
- Update technology-specific guidance and best practices
- Maintain cross-workflow consistency

## Implementation Readiness Validation

### Technical Completeness Check
- [ ] All technology choices made and documented
- [ ] Data model covers all functional requirements
- [ ] API contracts support all user scenarios
- [ ] Security requirements addressed
- [ ] Performance considerations documented
- [ ] Integration points defined
- [ ] Development environment specified

### Quality Validation
- [ ] Architecture supports scalability requirements
- [ ] Security model matches threat analysis
- [ ] Data model supports all business rules
- [ ] API design follows established patterns
- [ ] Documentation covers all major decisions

### Constitution Alignment Re-check
After design phase, re-validate constitutional compliance:
- [ ] All principles still satisfied
- [ ] No new violations introduced
- [ ] Quality gates still passing
- [ ] Compliance requirements met

## Risk Assessment

### Technical Risks
- **High Risk:** [Critical technical challenges]
- **Medium Risk:** [Moderate technical concerns]
- **Low Risk:** [Minor technical considerations]

### Mitigation Strategies  
For each identified risk:
- **Risk:** [Description]
- **Impact:** [Consequences if occurs]
- **Likelihood:** [Probability of occurrence]
- **Mitigation:** [Prevention and response strategies]
- **Contingency:** [Alternative approaches if needed]

### Dependencies and Assumptions
- **External Dependencies:** [Third-party services, libraries, team dependencies]
- **Technical Assumptions:** [Environment, performance, security assumptions]
- **Business Assumptions:** [User behavior, usage patterns, business rules]

## Next Phase Preparation

### Task Breakdown Readiness
Ensure plan provides sufficient detail for task generation:
- [ ] Clear technology choices and architecture
- [ ] Complete data model and API specifications  
- [ ] Development environment and tooling defined
- [ ] Quality standards and testing approach specified
- [ ] Integration requirements and dependencies clear

### Implementation Prerequisites
- [ ] All research completed and documented
- [ ] Technical architecture validated
- [ ] Development environment requirements specified
- [ ] Third-party integrations planned
- [ ] Quality assurance approach defined
```

### Step 3: Fill Technical Context
Analyze the specification and fill in technical decisions:

**Architecture Analysis:**
1. **Extract Technical Requirements:** Review spec for technology hints and constraints
2. **Assess Complexity:** Determine appropriate architecture scale
3. **Identify Integration Needs:** External services, APIs, data sources
4. **Security Requirements:** Authentication, authorization, data protection
5. **Performance Needs:** Scalability, response time, throughput requirements

**Decision Process:**
- Make informed technology choices based on requirements
- Document rationale for each major decision
- Consider team skills, project constraints, and maintenance
- Mark genuinely ambiguous choices as NEEDS CLARIFICATION

### Step 4: Constitution Compliance Check  
Load constitution and validate plan alignment:

**Commands to run:**
```bash
# Load constitution for compliance review
cat .clinerules/memory/constitution.md
```

**Validation Process:**
1. **Extract Constitutional Principles:** Load all MUST and SHOULD requirements
2. **Map to Plan Elements:** Show how each principle is addressed
3. **Identify Conflicts:** Flag any constitutional violations  
4. **Document Compliance:** Create compliance matrix
5. **Gate Decision:** PASS/FAIL - must be PASS to proceed

**If FAIL:** Stop and require constitution updates or plan changes before proceeding.

### Step 5: Phase 0 - Research Tasks
Generate research tasks for unresolved technical decisions:

**Research Generation:**
- For each NEEDS CLARIFICATION → create research task
- For each major technology choice → create best practices task  
- For each integration → create patterns research task
- For each security requirement → create security analysis task

**Research Coordination:**
```markdown
# Research Plan

## Technology Decisions Needed
1. **[Technology Area]**
   - **Question:** [What needs to be decided]
   - **Options:** [Alternatives to evaluate]  
   - **Criteria:** [How to choose between options]
   - **Timeline:** [When decision is needed]

2. **[Integration Pattern]**
   - **Question:** [Integration approach needed]
   - **Research Areas:** [What to investigate]
   - **Success Criteria:** [How to evaluate approaches]
   - **Dependencies:** [What this decision affects]
```

**Create Research File:**
Generate `specs/[feature]/research.md` with consolidated research plan and findings template.

### Step 6: Phase 1 - Design Artifacts
**Prerequisites:** All research completed and NEEDS CLARIFICATION resolved

**Data Model Generation:**
1. **Entity Extraction:** Scan functional requirements for nouns and data objects
2. **Relationship Mapping:** Identify connections between entities
3. **Validation Rules:** Extract business rules from acceptance criteria  
4. **State Modeling:** Identify entity lifecycles and state transitions

**API Contract Creation:**
1. **Endpoint Design:** Map each user action to API operations
2. **Request/Response Modeling:** Define data formats and validation
3. **Error Handling:** Standard error responses and codes
4. **Security Integration:** Authentication and authorization per endpoint

**Environment Setup:**
1. **Quickstart Guide:** Developer onboarding instructions
2. **Build Configuration:** Development and deployment setup
3. **Testing Framework:** Unit, integration, and e2e testing setup  
4. **CI/CD Pipeline:** Automated build, test, and deployment

### Step 7: Validation and Finalization
Perform comprehensive validation before completion:

**Technical Validation:**
- All technology choices documented with rationale
- Data model supports all functional requirements  
- API contracts cover all user scenarios
- Security architecture addresses all requirements
- Performance considerations documented
- Integration points clearly defined

**Quality Validation:**  
- Architecture supports scalability needs
- Security model matches threat analysis
- Documentation complete and consistent
- Best practices followed throughout

**Constitution Re-check:**
- All principles still satisfied after design decisions
- No new violations introduced during planning
- Quality gates remain PASS status

### Step 8: Plan Completion and Handoff
Finalize implementation plan and prepare for task breakdown:

**Commands to run:**
```bash
# Add all planning artifacts
git add specs/*/plan.md specs/*/research.md specs/*/data-model.md specs/*/contracts/ specs/*/quickstart.md

# Commit implementation plan
git commit -m "feat: add implementation plan for [feature-name]

- Technical architecture and technology stack decisions
- Data model design with entity relationships  
- API contracts and interface specifications
- Development environment setup guide
- Constitutional compliance validation"
```

**Completion Report:**
- Branch name and plan file path
- Generated artifacts summary
- Constitutional compliance status
- Readiness for task breakdown (`tasks` workflow)
- Any remaining dependencies or assumptions

## Quality Guidelines

### Architecture Decision Documentation
Each major technical decision should include:
1. **Context:** What situation led to this decision
2. **Options:** Alternatives that were considered  
3. **Decision:** What was chosen and why
4. **Consequences:** Expected positive and negative outcomes
5. **Reversibility:** How difficult it would be to change this decision

### Data Model Best Practices
- **Normalize appropriately:** Balance normalization vs. performance
- **Plan for scale:** Consider future growth and performance needs
- **Validate early:** Ensure model supports all business rules
- **Document assumptions:** Make implicit rules explicit
- **Consider privacy:** Address data protection and compliance needs

### API Design Principles  
- **RESTful patterns:** Follow standard REST conventions where applicable
- **Consistent naming:** Use clear, consistent naming throughout
- **Version planning:** Design for API evolution and backward compatibility
- **Security first:** Integrate security into API design, not as afterthought
- **Error handling:** Provide clear, actionable error messages

## Dependencies
- Completed and validated specification (`specify` and `clarify` workflows)
- Project constitution for compliance checks
- Optional: Existing architecture documentation or standards

## Outputs
- `specs/[feature]/plan.md` - Complete implementation plan
- `specs/[feature]/research.md` - Technology research and decisions
- `specs/[feature]/data-model.md` - Data model and entity design
- `specs/[feature]/contracts/` - API specifications and contracts
- `specs/[feature]/quickstart.md` - Development setup guide
- Updated AI assistant context with new technologies

## Next Steps
After running this workflow:
- Run `tasks` workflow to break down implementation into specific tasks
- Set up development environment using quickstart guide
- Begin implementation following the documented architecture
- Validate constitutional compliance throughout development
