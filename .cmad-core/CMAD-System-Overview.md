# CMAD System Overview
**Claude-Made Agent Development Framework**

## Introduction

The CMAD (Claude-Made Agent Development) system is a comprehensive AI-driven software development framework that transforms complex requirements into production-ready code through a structured, multi-phase process. This system leverages specialized AI agents working in concert with human engineers to deliver high-quality software implementations.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CMAD Development Pipeline                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Research & Analysis                                  │
│  ┌─────────────┐        ┌──────────────────────┐             │
│  │   Human     │───────▶│  Code Research       │             │
│  │  Engineer   │        │  Analyst Agent       │             │
│  └─────────────┘        └──────────────────────┘             │
│        │                          │                            │
│        │                          ▼                            │
│        │                 ./ai-docs/research/*.md              │
│        ▼                                                       │
│  Phase 2: Planning                                            │
│  ┌─────────────┐        ┌──────────────────────┐             │
│  │Requirements │───────▶│  Implementation      │             │
│  │  Document   │        │  Planner Agent       │             │
│  └─────────────┘        └──────────────────────┘             │
│                                   │                            │
│                                   ▼                            │
│                          ./ai-docs/epics/*.md                 │
│                                                                │
│  Phase 3: Story Creation                                      │
│                          ┌──────────────────────┐             │
│                          │  User Story          │             │
│                          │  Creator Agent       │             │
│                          └──────────────────────┘             │
│                                   │                            │
│                                   ▼                            │
│                         ./ai-docs/stories/*.md                │
│                                                                │
│  Phase 4: Implementation                                      │
│                          ┌──────────────────────┐             │
│                          │  Developer           │             │
│                          │  Agent               │             │
│                          └──────────────────────┘             │
│                                   │                            │
│                                   ▼                            │
│                          Production Code + Tests               │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Research & Analysis

### Purpose
Conduct deep technical investigation to understand existing systems, identify patterns, and gather requirements for new features or modifications.

### Human Step: Initiating Research
The human engineer determines what research is needed and provides clear direction to the Code Research Analyst agent.

#### Key Decisions:
1. **Scope Definition**: What specific area needs investigation?
2. **Depth Required**: Surface-level overview or deep dive?
3. **Output Goals**: What decisions will this research inform?

#### Example Research Prompts:

**System Analysis:**
```
"Analyze the authentication system in this application, including all entry points, 
data flows, security measures, and integration points. Focus on JWT implementation 
and session management."
```

**Feature Investigation:**
```
"Research how the real-time notification system works, including WebSocket 
connections, event handling, message queuing, and client-side updates."
```

**Performance Analysis:**
```
"Analyze the database query patterns in the reporting module. Identify bottlenecks, 
N+1 queries, missing indexes, and optimization opportunities."
```

**Technology Comparison:**
```
"Compare RabbitMQ vs Redis for our message queue needs. Consider throughput, 
persistence, clustering capabilities, and integration with our Node.js stack."
```

**Code Quality Review:**
```
"Review the api-worker service for code quality, identifying technical debt, 
security vulnerabilities, and areas needing refactoring."
```

### Agent Step: Code Research Analyst
The Code Research Analyst agent performs comprehensive analysis following the structured template.

#### Agent Capabilities:
- Deep code inspection and pattern analysis
- Architecture mapping and documentation
- Performance profiling and bottleneck identification
- Security vulnerability assessment
- Technology comparison and evaluation

#### Output:
- Detailed research document saved to `./ai-docs/research/`
- Structured findings with evidence and code references
- Actionable recommendations for improvement
- Technical specifications for implementation

---

## Phase 2: Epic/Implementation Planning

### Purpose
Transform research findings and requirements into actionable development plans with clear user stories and technical specifications.

### Human Step: Creating Requirements Document
The human engineer creates a comprehensive requirements document that bridges research findings with business objectives.

#### Requirements Document Structure:

```markdown
# Implementation Requirements: [Feature Name]

## Objective
[Clear statement of what needs to be built and why]

## Research References
- Link to: ./ai-docs/research/[relevant-research].md
- Link to: ./ai-docs/research/[another-research].md

## Functional Requirements
1. [User-facing capability 1]
2. [User-facing capability 2]
3. [Business rule 1]
4. [Business rule 2]

## Technical Requirements
1. [Performance requirement]
2. [Security requirement]
3. [Integration requirement]
4. [Scalability requirement]

## Constraints
- [Time constraint]
- [Technology constraint]
- [Resource constraint]

## Success Criteria
- [Measurable outcome 1]
- [Measurable outcome 2]
- [Quality metric]

## Reference Files
- Current implementation: [file paths]
- Similar features: [file paths]
- Configuration files: [file paths]
```

#### Example Requirements Prompts:

**New Feature:**
```
"Create an implementation plan for a multi-factor authentication system based on 
the research in ./ai-docs/research/auth-analysis.md. 

Required capabilities:
- TOTP (Time-based One-Time Password) support with QR code generation
- SMS verification with fallback providers
- Backup codes (8-10 single-use codes)
- Integration with existing JWT system in node-server/src/middleware/auth.ts
- Account recovery flow for lost devices

Technical requirements:
- Use existing user model in node-server/src/database/models/user.ts
- Store MFA settings in PostgreSQL with encryption for sensitive data
- Implement rate limiting for verification attempts
- Support grace period for MFA enrollment
- WebSocket notifications for security events

Reference the following:
- Current auth implementation: node-server/src/controllers/authController.ts
- JWT service: node-server/src/services/jwtService.ts
- Database migrations pattern: node-server/src/database/migrations/
- Security requirements from research document sections 3 and 4"
```

**Migration:**
```
"Develop a migration epic for moving from RabbitMQ to Redis based on 
./ai-docs/research/queue-comparison.md.

Migration requirements:
- Zero downtime during transition
- Gradual rollout with feature flags
- Dual-write period for safety
- Message format compatibility layer
- Complete rollback procedures

Technical specifications:
- Current RabbitMQ implementation: api-worker/src/services/messageQueue.ts
- Redis cluster configuration for high availability
- Message persistence strategy for critical queues
- Performance benchmarks from research section 5
- Monitor metrics during transition

Phases needed:
1. Compatibility layer implementation
2. Dual-write capability
3. Consumer migration (canary deployment)
4. Producer migration
5. Cleanup and optimization

Reference:
- Queue interface: api-worker/src/interfaces/IMessageQueue.ts
- Current consumers: api-worker/src/consumers/
- Performance metrics: ./ai-docs/research/queue-comparison.md section 7
- Risk assessment: ./ai-docs/research/queue-comparison.md section 9"
```

**Refactoring:**
```
"Plan a refactoring epic for the reporting module based on 
./ai-docs/research/reporting-performance.md.

Optimization targets:
- Reduce report generation time by 70% (current: 45s, target: <15s)
- Implement intelligent caching with Redis
- Convert synchronous operations to async with progress tracking
- Optimize database queries identified in research section 3

Specific improvements needed:
- Fix N+1 queries in node-server/src/services/reportService.ts lines 234-267
- Add composite indexes for common report queries
- Implement materialized views for aggregate data
- Add query result caching with smart invalidation
- Stream large datasets instead of loading into memory

Architecture changes:
- Introduce report queue for async processing
- Add progress tracking via WebSocket
- Implement caching layer with TTL strategy
- Create dedicated read replicas for reports

Reference:
- Current implementation: node-server/src/modules/reporting/
- Database queries: node-server/src/repositories/reportRepository.ts
- Performance bottlenecks: ./ai-docs/research/reporting-performance.md section 4
- Query optimization opportunities: ./ai-docs/research/reporting-performance.md section 6
- Caching strategy recommendations: ./ai-docs/research/reporting-performance.md section 8"
```

### Agent Step: Implementation Planner
The Implementation Planner agent creates comprehensive epics with detailed user stories.

#### Agent Capabilities:
- Breaking down complex features into manageable stories
- Defining clear acceptance criteria
- Specifying technical implementation details
- Creating dependency maps between stories
- Estimating effort and complexity

#### Output:
- Complete epic document saved to `./ai-docs/epics/`
- 5-10 user stories with full specifications
- Technical architecture decisions
- Sprint planning recommendations

---

## Phase 3: User Story Creation

### Purpose
Transform epic-level stories into detailed, developer-ready specifications with code examples and test requirements.

### Human Step: Story Selection
The human engineer selects which stories from the epic to develop into full specifications.

#### Example Story Creation Prompts:

**Single Story:**
```
"Create user story 2 from the authentication epic in 
./ai-docs/epics/auth-implementation.md"
```

**Multiple Stories:**
```
"Generate stories 3, 4, and 5 from the migration epic in 
./ai-docs/epics/rabbitmq-to-redis-migration.md"
```

**Priority Story:**
```
"Create the database schema story (story 1) from 
./ai-docs/epics/reporting-refactor.md"
```

### Agent Step: User Story Creator
The User Story Creator agent expands epic stories into comprehensive development specifications.

#### Agent Capabilities:
- Extracting exact story requirements from epics
- Creating detailed code skeletons and examples
- Defining precise file modifications
- Specifying complete test scenarios
- Writing clear acceptance criteria checklists

#### Output:
- Detailed story document saved to `./ai-docs/stories/`
- Complete implementation specifications
- Code templates and examples
- Test requirements and data
- Development checklists

---

## Phase 4: Development Execution

### Purpose
Implement user stories with production-quality code, comprehensive testing, and full validation of acceptance criteria.

### Human Step: Story Assignment
The human engineer assigns stories to the Developer agent for implementation.

#### Example Development Prompts:

**Standard Implementation:**
```
"Implement the user story in 
./ai-docs/stories/auth-story-2-registration-endpoint.md"
```

**TDD Approach:**
```
"Execute story 3 from ./ai-docs/stories/migration-story-3-queue-adapter.md 
following test-driven development"
```

**Priority Implementation:**
```
"Implement the critical path story in 
./ai-docs/stories/reporting-story-1-query-optimization.md"
```

### Agent Step: Developer
The Developer agent implements stories with full testing and quality assurance.

#### Agent Capabilities:
- Reading and understanding complete story specifications
- Writing production-quality code
- Creating comprehensive unit tests (>80% coverage)
- Implementing integration tests
- Running all test suites until passing
- Validating acceptance criteria

#### Output:
- Production code implementation
- Complete test suite (unit + integration)
- All acceptance criteria met
- Code quality checks passed
- Ready for code review

---

## Workflow Best Practices

### 1. Research Phase Best Practices
- **Be Specific**: Clearly define what needs investigation
- **Set Boundaries**: Specify which files/modules to focus on
- **Define Success**: What questions should the research answer?
- **Request Evidence**: Ask for specific code examples and metrics

### 2. Planning Phase Best Practices
- **Link Research**: Always reference research documents
- **Clear Objectives**: State what success looks like
- **Technical Specs**: Include performance and security requirements
- **Constraints**: Document any limitations or dependencies

### 3. Story Creation Best Practices
- **Story Selection**: Choose stories in dependency order
- **Batch Creation**: Create related stories together
- **Review First**: Read the epic before requesting stories
- **Validate Completeness**: Ensure all details are captured

### 4. Development Phase Best Practices
- **Sequential Execution**: Complete prerequisite stories first
- **Test Everything**: Never skip test implementation
- **Validate Acceptance**: Check every criterion before completion
- **Clean Commits**: Make logical, well-described commits

---

## File Structure & Outputs

```
.cmad-core/
├── agents/
│   ├── code-research-analyst.md    # Research agent definition
│   ├── implementation-planner.md   # Planning agent definition
│   ├── user-story-creator.md      # Story agent definition
│   └── developer.md               # Developer agent definition
├── templates/
│   ├── code-analysis-template.md  # Research output template
│   ├── implementation-plan-template.md  # Epic template
│   └── user-story-template.md     # Story template
└── CMAD-System-Overview.md        # This document

ai-docs/
├── research/                      # Phase 1 outputs
│   ├── auth-analysis.md
│   ├── queue-comparison.md
│   └── performance-review.md
├── epics/                        # Phase 2 outputs
│   ├── auth-implementation.md
│   ├── migration-epic.md
│   └── refactor-plan.md
├── stories/                      # Phase 3 outputs
│   ├── auth-story-1-schema.md
│   ├── auth-story-2-registration.md
│   └── auth-story-3-login.md
└── requirements/                  # Human-created requirements
    └── auth-requirements.md
```

---

## Success Metrics

### Research Quality
- Comprehensive coverage of specified scope
- Clear, actionable recommendations
- Evidence-based findings
- Well-structured documentation

### Planning Quality
- Complete feature breakdown
- Clear acceptance criteria
- Realistic story sizing
- Proper dependency mapping

### Story Quality
- Detailed implementation specs
- Complete test requirements
- Clear code examples
- Measurable acceptance criteria

### Implementation Quality
- All tests passing
- >80% code coverage
- Acceptance criteria met
- Clean, maintainable code

---

## Common Patterns & Anti-Patterns

### ✅ Good Patterns
- **Incremental Development**: Small, focused stories
- **Clear Documentation**: Every phase well-documented
- **Test-First**: Writing tests before code
- **Dependency Awareness**: Completing prerequisites first

### ❌ Anti-Patterns
- **Big Bang Stories**: Trying to do too much in one story
- **Skipping Research**: Going straight to implementation
- **Incomplete Specs**: Missing acceptance criteria
- **Test Skipping**: Implementing without tests

---

## Troubleshooting Guide

### Research Phase Issues
**Problem**: Research too broad or unfocused
**Solution**: Narrow scope, specify exact files/features

**Problem**: Missing technical details
**Solution**: Request specific code examples and metrics

### Planning Phase Issues
**Problem**: Stories too large
**Solution**: Break down into smaller, focused stories

**Problem**: Unclear requirements
**Solution**: Add specific acceptance criteria

### Story Creation Issues
**Problem**: Missing implementation details
**Solution**: Reference code examples from research

**Problem**: Incomplete test specs
**Solution**: Add specific test scenarios and data

### Development Phase Issues
**Problem**: Tests failing
**Solution**: Review story specs, fix implementation

**Problem**: Performance issues
**Solution**: Profile code, optimize queries

---

## Future Enhancements

### Planned Improvements
- [ ] Automated story dependency resolution
- [ ] Performance benchmarking integration
- [ ] Automated code review agent
- [ ] Deployment automation agent
- [ ] Documentation generation agent

### Integration Opportunities
- CI/CD pipeline integration
- Project management tool sync
- Automated testing frameworks
- Code quality metrics tracking
- Performance monitoring integration

---

## Conclusion

The CMAD system provides a structured, reliable approach to AI-driven software development. By following this framework, teams can leverage AI capabilities while maintaining high code quality, comprehensive testing, and clear documentation throughout the development lifecycle.

Each phase builds upon the previous one, creating a traceable path from initial research to production deployment. The system's strength lies in its structured approach, specialized agents, and emphasis on human oversight at critical decision points.

---

**Document Version**: 1.0
**Last Updated**: [Current Date]
**Framework Status**: Active Development
**Feedback**: Submit issues or suggestions via project repository