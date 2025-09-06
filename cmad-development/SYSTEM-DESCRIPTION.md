# Top Level System Description

## Phase 0: Document Project with CLAUDE.md Network

- **CC Agent:** Analyst
- **Templates:** 
  - TopCLAUDE.md
  - SubCLAUDE.md

## Phase 1: Define the Work Item

### Work Item Definition
The work item is the top level work plan. A work item is a single overarching task, whether it is a simple 1 story task, or a feature which will require an epic and multiple stories.

### Human Task
Define the requirements of the work item; the end goals.

### CC Agent: Agent Boss
- **Trigger:** "Create work item request" which will define the end goals and requirements
- **Action:** Agent will create `.cmad/work-items/{ItemName}` sub-directory based on a template provided to the agent
- **Initial Status:** `STATUS.md` will keep track of the work item status, and the initial status will be "Initial: waiting for research requirements"

#### Directory Structure
```
.cmad/work-items/{ItemName}/
├── goals.md
├── research/
├── epics/
├── stories/
└── status.md
```

## Phase 2: Research

### Human Task
Define the research items which will be required to create the architecture, epic(s) and stories for this project.

#### Research Planning Considerations
When defining these items, think in terms of what context the AI agents will need to plan and architect this feature. 

**Example:** If you are adding a new model/api/controller to your project by porting over a similar system from a different project, your items might be:

- Research and document the Gadget model/API/controller in `<path-to-other-project>`
- Research and document the model/API/controller format in `<this-project>`, as well as the migration file format
- Research and understand the contextual differences between `<this-project>` and `<that-project>`

**Action:** Create these prospective research tasks in a document

### CC Agent: Agent Boss

#### Interaction Flow
1. **Human:** "Let's continue the Gadget work item"
2. **Agent Response:** "Waiting for research requirements"
3. **Human:** Copy the research requirement document
4. **Agent Action:** 
   - Agent Boss will create `requirements.md` in `research/`
   - Change the work item `status.md` to "Research Phase: requirements documented"


Future phases pending...