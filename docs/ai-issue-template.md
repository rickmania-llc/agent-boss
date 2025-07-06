# [FEATURE/BUG/ENHANCEMENT NAME] Issue

## Overview

[Provide a clear, concise description of what needs to be implemented/fixed. Describe the problem, the solution, and the impact on the system.]

## Current State

[Describe the current implementation and what specifically is wrong or missing]

**Current Code Location**: `[path-from-project-root]` lines [start-end]

```[language]
[Current code snippet that needs modification]
// <-- [Comment indicating what's wrong or what needs to be changed]
```

## Requirements

### Primary Requirement

- [Main objective that unblocks the feature or fixes the issue]

### [System/Feature] Requirements

The [system/feature] should support:

1. **[Requirement 1]** - [Clear description]
2. **[Requirement 2]** - [Clear description]
3. **[Requirement 3]** - [Clear description]
4. **[Requirement 4]** - [Clear description]

### [Specific Component] Requirements

- **[Aspect 1]**: [Specific requirement with details]
- **[Aspect 2]**: [Specific requirement with details]
- **[Aspect 3]**: [Specific requirement with details]
- **[Aspect 4]**: [Specific requirement with details]

### [Data/API/Integration] Requirements

- **[Flow 1]**: [Step 1] → [Step 2] → [Step 3]
- **[Flow 2]**: [Description of data/event flow]
- **[Flow 3]**: [Description of integration pattern]
- **[Flow 4]**: [Error handling or edge cases]

## Technical Implementation Plan

### Phase 1: [Phase Name]

[Describe what this phase accomplishes]:

- **File**: `[path-from-project-root]`
- **Lines [start-end]**: [Describe the change needed]
  ```[language]
  [Code snippet showing the change]
  ```
- [Additional specific changes with file locations and line numbers]
- [Maintain existing functionality notes]

### Phase 2: [Phase Name]

[Describe what this phase accomplishes]:

- **File**: `[path-from-project-root]`
- **Line [number]**: [Describe modification needed]
  ```[language]
  // After line [X], replace lines [Y-Z] with:
  [Code snippet]
  ```
- **Line [number]**: [Another modification]
  ```[language]
  [Code snippet]
  ```
- **Line [number]**: [Setup or conditional logic]
  ```[language]
  [Code snippet]
  ```

### Phase 3: [Phase Name]

[Describe what this phase accomplishes]:

- **File**: `[path-from-project-root]`
- **After line [number]**: Add new method `[methodName]()`:
  ```[language]
  [Complete method implementation with comments]
  ```

### Phase 4: [Phase Name] (FUTURE/OPTIONAL)

[Describe future enhancements not part of current implementation]:

- **Future Location**: [Where this would go]
- **Future Method**: `[methodName](params)`
- **Future Integration Points**:
  - [Integration description]
  - [Event flow description]
  - [Dependency requirements]
- NOTE: [Explain why this is future work]

## File References

### Core [System/Feature] Files

- `[path-from-project-root]` - [Description of file's role]
- `[path-from-project-root]` - [Description of file's role]
- `[path-from-project-root]` - [Description of file's role]

### Documentation References

- `[path-from-project-root]` - [Description of documentation]
- `[path-from-project-root]` - [Description of documentation]

### Existing [Related] Files (Patterns to Follow)

- `[path-from-project-root]` - [Description and pattern to follow]
- `[path-from-project-root]` - [Description and pattern to follow]
- `[path-from-project-root]` - [Description and pattern to follow]

### [Environment/Configuration]

- **[Config 1]**: [Configuration details - environment variables, ports, etc.]
- **[Config 2]**: [Configuration requirements]

## Implementation TODOs

### [Component/Feature] Development TODOs

- [ ] **[Task description]** (`[path-from-root/filename]` lines [X-Y]):
  - [Specific change needed]
  - [Expected behavior]
- [ ] **[Task description]** (line [X]): [What needs to happen]
- [ ] **[Task description]** (line [X]): [Implementation detail]
- [ ] **[Task description]** (lines [X-Y]):
  - [Action 1]
  - [Action 2]
  - [Action 3]
  - [Action 4]
- [ ] **[Task description]** (`[path-from-root/Component/File]`): [Details]

### [System/Service] Handler TODOs

- [ ] **[Task description]** (`[path-from-root/filename.ts]` line [X]):
  - [Implementation detail]
  - [Specific behavior]
- [ ] **[Task description]** (lines [X-Y]):
  - [Change needed]
  - [Expected outcome]
- [ ] **[Task description]** (line [X]):
  - [Action 1]
  - [Action 2]
- [ ] **[Task description]** (after line [X]):
  - [What to add]
  - [Method/function details (lines X-Y)]
  - [Data format requirements (lines X-Y)]
  - [Error handling]
- [ ] **[Task description]** (lines [X-Y]):
  - [Conditional logic]
  - [Update requirements]

### [Integration/Broadcasting] TODOs (FUTURE)

These are for future implementation when [condition]:

- [ ] FUTURE: [Task description] after line [X]
- [ ] FUTURE: [Pattern description] pattern
- [ ] FUTURE: [Integration description]
- [ ] FUTURE: [Event mapping] (`[path-from-root/file]` lines [X-Y])

### Testing and Validation TODOs

- [ ] **[Test scenario]**:
  - [Test case 1]
  - [Test case 2]
- [ ] **[Test scenario]**:
  - [Condition to verify]
  - [Expected result]
- [ ] **[Test scenario]**:
  - [Data validation]
  - [Format verification]
  - [Default value checks]
- [ ] **[Test scenario]**:
  - [Behavior 1]
  - [Behavior 2]

### **MANDATORY: Documentation Update TODOs**

- [ ] **Update [service-dir]/CLAUDE.md** (lines [X-Y]):
  - [What to add/update]
  - [Architecture changes]
  - [New features]
- [ ] **Update [service-dir]/src/[module]/CLAUDE.md**:
  - [Section to update] (after line [X])
  - [Method documentation]
  - [Pattern documentation (after line [Y])
  - [Event flow documentation]
- [ ] **Update [frontend-dir]/CLAUDE.md**:
  - [Component description] (line [X])
  - [Connection changes]
  - [Pattern documentation]
- [ ] **Create [path-from-root]/README.md** (if not exists):
  - [Documentation content]
  - [Pattern explanation]
  - [Dependencies note]

## Acceptance Criteria

### Functional Acceptance

1. **[Criteria 1]**: [Specific measurable outcome]
2. **[Criteria 2]**: [Specific measurable outcome]
3. **[Criteria 3]**: [Specific measurable outcome]
4. **[Criteria 4]**: [Specific measurable outcome]
5. **[Criteria 5]**: [Specific measurable outcome]

### Performance Acceptance

1. **[Performance Metric 1]**: [Specific performance requirement with measurable target]
2. **[Performance Metric 2]**: [Specific performance requirement with measurable target]
3. **[Performance Metric 3]**: [Specific performance requirement with measurable target]

### Quality Acceptance

1. **[Quality Aspect 1]**: [Specific quality requirement]
2. **[Quality Aspect 2]**: [Specific quality requirement]
3. **[Quality Aspect 3]**: [Specific quality requirement]
4. **[Quality Aspect 4]**: [Specific quality requirement]

### **MANDATORY: Documentation Acceptance**

1. **CLAUDE.md Updates Complete**: All relevant directory-level `CLAUDE.md` files have been updated with new functions, files, and architectural changes
2. **Documentation Accuracy**: Updated documentation accurately reflects implemented functionality and follows established format
3. **Completeness Check**: No new functions or files are missing from appropriate `CLAUDE.md` files
4. **Architectural Consistency**: Any architectural changes are reflected in relevant documentation

## Development Notes

### [Authentication/Data/Integration] Pattern to Follow

For this implementation with [specifics]:

- [Pattern detail 1]
- [Pattern detail 2]
- [Pattern detail 3]
- [Pattern detail 4]

### [Data Format/API/Event] Pattern

Follow [reference] format from `[path-from-root/file/spec]`:

- [Data structure 1]: [Format details]
- [Data structure 2]: [Format details]
- [Data structure 3]: [Format details]
- [Data structure 4]: [Format details]

### [Broadcasting/Communication] Pattern

Follow [reference] pattern from `[path-from-root/file/spec]`:

- [Pattern aspect 1]
- [Pattern aspect 2]
- [Pattern aspect 3]

## CLAUDE.md Update Requirements

**This section MUST be completed as part of issue implementation:**

### Directories Requiring CLAUDE.md Updates

- `[path-from-root/directory]` - [Reason for update: new file, new functions, architectural change]
- `[path-from-root/directory]` - [Reason for update: new file, new functions, architectural change]
- `[path-from-root/directory]` - [Reason for update: new file, new functions, architectural change]

### New Functions to Document

- `[functionName]()` in `[path-from-root/file.ts]` - [Purpose and parameters]
- `[functionName]()` in `[path-from-root/file.ts]` - [Purpose and parameters]
- `[functionName]()` in `[path-from-root/file.ts]` - [Purpose and parameters]

### New Event Flows to Document

- [Event flow 1 description]
- `[event1]`/`[event2]` event pair
- [Event flow 3 description]
- [Event flow 4 description]

### Architectural Changes to Document

- [Architecture change 1]
- [Architecture change 2]
- [Architecture change 3]
- [Architecture change 4]

## Implementation Instructions for Claude Code

**CRITICAL: During implementation, you MUST:**

1. **Start with Phase 1**: [Implementation priority/order]
2. **Maintain compatibility**: [What must continue working]
3. **Follow [pattern] patterns**: Use proven patterns from [path-from-root] implementation
4. **Test incrementally**: [Testing approach]
5. **Update documentation**: [Documentation requirements]

**Upon completion, you MUST:**

6. **Verify end-to-end**: [What to test completely]
7. **Document all changes**: Update all identified `CLAUDE.md` files
8. **Create completion summary**: Document what was changed and testing steps
9. **Note any issues**: Document any problems encountered for future reference

**Documentation updates and completion summary are not optional - they are required for issue completion.**
