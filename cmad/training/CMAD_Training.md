# CMAD AI Development Process Reference

## Overview

This document outlines the comprehensive AI development process using the CMAD framework with Claude Code. This process breaks down feature development into four distinct phases, each with specific agents and responsibilities.

## Example Feature Requirements

Throughout this guide, we'll use this example feature to illustrate the process:

**Feature Requirements:**
- Allow users to create email lists which can be attached to Automated Actions
- If the automated action is triggered, every address in that list should receive an email notification
- Though the VEMASS project has a default email server using AWS, allow the client to optionally set up their own SMTP Server
- The SMTP set-up should mirror the functionality of the Site Manager project

---

## Phase 1: Research and Pre-planning

**Directory:** `training/phase1_research/`

### Purpose

In this phase, you're asking yourself: *In a very top-level way, how will I accomplish the task I've been given and what information will the AI planner agent need to create a comprehensive implementation plan/epic to accomplish that task.*

### Your Responsibilities

1. **Create a basic framework** of what you'll need:
   - Identify the core models/components required
   - Determine relationships and dependencies
   - Identify what needs to be researched

2. **Identify what the AI needs to research:**
   - What existing codebases or implementations can be referenced?
   - What technical information is required for the planner?
   - What screenshots, documentation, or examples are needed?

### Example Framework

For our email list feature, we need:
- A new model called `EmailList` with an array of email addresses
- One or more email lists can be attached to an Automated Action
- The user can set up their own SMTP server (probably uses settings model framework with key/value pairs)

### Example Prompt to Researcher Agent

```
**IMPORTANT: Read .claude/agents/researcher.md and become the researcher agent for this task**

As the researcher agent... Examine the screenshot at ref/SMTPScreenshot.png. I'd like you to find that page in the vmass codebase (Project at /home/chad/Valcom/vmass) Examine the front end and back end implementation of their email setup. How does it work? What is the logic flow? What do each of the variables mean in the UI configuration page (the image I gave you) Think hard and create a comprehensive md explaining all this.
```

### Example Output

**Reference:** `training/phase1_research/vmass-email-smtp-analysis.md`

### Review Process

Do a quick review of the research document and tell the AI if any changes need to be made. Always think in terms of *how this document will help the planner agent create an implementation plan.*

---

## Phase 2: Architecture

**Directory:** `training/phase2_planning/`

### Purpose

In this phase, you create detailed instructions for the planner agent who will create an epic/implementation plan. This plan will be used by the scrum-master agent to create detailed user stories (issues).

### Your Responsibilities

1. Create detailed instructions for the planner agent
2. Reference any research documents created in Phase 1
3. Break down the feature into logical implementation steps
4. Specify technical requirements, patterns, and constraints

### Example Prompt to Planner Agent

```
**IMPORTANT: Read .claude/agents/planner.md and become the planner agent. Think hard**

- Read the research document at ai-docs/research/vmass-email-smtp-analysis.md and use that as a reference for the SMTP fields

As the planner agent, create the following plan:

1. Add SMTP settings to the settings object. This involves updating the initData scripts for new installs (scripts/database/initCiData.sh, scripts/database/initData.sh, scripts/database/initTestData.sh), and updating the upgrade script for existing installs (scripts/release/ubuntu22/upgradeUbuntu22.sh). Note how the upgrade script conditionally adds new settings rows. There should be a setting field for each item required for SMTP

2. Create an SMTP settings page which will exist in the settings accordion, and require the same permissions as the settings > general page to appear. Use the general settings UI page as a reference for making the specific SMTP settings appear on this new page, and connect it to the backend settings API the same way general settings does. You should be able to use the current settings API without any changes.

3. Create a new EmailList model/controller/service/API. EmailList will be a simple model which contains a Label, and an array of strings (Emails: ["","",""]) using PSQL array. EmailList permissions will use the same permission requirements as events/automated actions (automated, get:1, RUD: 2). The model should have MANY-TO-MANY relationship with Events (automated actions)

4. Create the UI EmailList page in Settings accordion. Page will appear if they have automated: 1, and be editable if they automated: 2. This will be a basic UI where they can add, edit, delete Email Lists.

5. Events/Automated Actions: Update the Event UI page to include an email lists field, email lists can now be added, removed from an Automated Action object

6. Email list processing. Find the place in the backend where user account emails are processed on events/automated actions. Process the email lists here. Note that IF the system has SMTP settings you will use those email settings, and if it does not, you will use the default email server (Valcom AWS email server) which already exists in the system.
```

### Example Output

**Reference:** `training/phase2_planning/2025-10-16-smtp-email-list-plan.md`

### Review Process

The implementation plan is **the most important document in the process**. Carefully examine and review it, prompting the AI to make necessary changes.

**Key Review Points:**
1. Is the technical approach sound?
2. Are all dependencies identified?
3. Is the implementation order logical?
4. Review the "Implementation Order Recommendation" section

**Story Combination Strategy:**
- Can recommended user stories be combined into larger stories?
- This allows the scrum master and developer to knock out larger chunks in fewer steps
- Consider: What will be good break points for testing?

---

## Phase 3: Story Creation

**Directory:** `training/phase3_stories/`

### Purpose

This phase uses the scrum-master agent (and developer agent later). Depending on the size and scope of the implementation plan, you can have the scrum-master create a few user stories, or a single story that covers the whole plan.

### Strategy Options

**Option A: Create All Stories First**
- Have scrum-master create all stories before any code is written
- Best for well-understood features with stable requirements

**Option B: Incremental Story Creation**
- Create one story, execute it with developer agent, then create next story
- Best for particularly complex epics where you want to keep a closer eye on what the AI is doing
- Allows you to update the implementation plan before creating subsequent stories if needed

### Example Prompt to Scrum Master Agent

```
**IMPORTANT: Read .claude/agents/scrum-master.md and become the scrum-master agent for this task. Think hard**

Read the implementation plan at ai-docs/plans/2025-10-16-smtp-email-list-plan.md. Create a user story which will combine the first 2 stories in the Implementation Order Recommendation:

1. **Story 1**: SMTP Settings Storage
   - Update initData.sh, upgradeUbuntu22.sh scripts
   - Test database initialization
   - Estimated: 1 story point

2. **Story 2**: SMTP Settings UI
   - Create SmtpSettings.tsx component
   - Add navigation and routing
   - Implement form and validation
   - Estimated: 3 story points
```

### Example Output

**Reference:** `training/phase3_stories/smtp-email-list-story-1.md`

### Review Process

At the end of this step, you should have a comprehensive user story. Check it for accuracy and prompt the AI to make any changes.

---

## Phase 4: Execution

**Directory:** `training/phase4_execution/`

### Purpose

The developer agent reads the user story and implements the code.

### Example Prompt to Developer Agent

```
**IMPORTANT: Read .claude/agents/developer.md and become the developer agent for this task.**

As the developer agent, read the story ai-docs/stories/smtp-email-list-story-1.md and execute. We will skip integration testing.
```

### Execution Strategies

**Auto-Edit Mode:**
- Accept every edit automatically
- Review everything at the end
- Faster but requires trust in the process

**Manual Approval Mode:**
- Approve every edit individually
- Keep a close eye on what the AI is doing
- Jump in to give instructions if needed
- Recommended approach: Generally accept edits while monitoring

### Best Practices

If you've been reviewing the plan and user stories carefully, there shouldn't be many instructions you need to give the developer during execution.

---

## Directory Structure Reference

```
training/
├── CMAD_Training.md                    # This file
│
├── phase0_requirements/
│   └── AI_Class.txt                    # Original process documentation
│
├── phase1_research/
│   ├── researchPrompt.txt              # Example prompt to researcher agent
│   └── vmass-email-smtp-analysis.md    # Example research output
│
├── phase2_planning/
│   ├── plannerPromptExample.txt        # Example prompt to planner agent
│   ├── plannerPromptTips.md            # Tips for crafting planner prompts
│   └── 2025-10-16-smtp-email-list-plan.md  # Example implementation plan
│
├── phase3_stories/
│   ├── scrumMasterPrompt.txt           # Example prompt to scrum-master agent
│   └── smtp-email-list-story-1.md      # Example user story
│
└── phase4_execution/
    └── developerPrompt.txt             # Example prompt to developer agent
```

---

## Agent Reference

### Researcher Agent
**Config:** `.claude/agents/researcher.md`
**Purpose:** Investigate existing implementations, analyze codebases, document findings
**Output:** Research documents explaining how things work

### Planner Agent
**Config:** `.claude/agents/planner.md`
**Purpose:** Create comprehensive implementation plans/epics
**Output:** Detailed technical plans with implementation order recommendations

### Scrum Master Agent
**Config:** `.claude/agents/scrum-master.md`
**Purpose:** Convert implementation plans into user stories
**Output:** Detailed user stories with acceptance criteria and technical specifications

### Developer Agent
**Config:** `.claude/agents/developer.md`
**Purpose:** Execute user stories and write code
**Output:** Working code implementations

---

## Process Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Task Requirements                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Research & Pre-planning                           │
│  ├─ Create basic framework                                  │
│  ├─ Identify what needs research                            │
│  ├─ Run researcher agent                                    │
│  └─ Review research documents                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Architecture                                      │
│  ├─ Create detailed planner instructions                    │
│  ├─ Run planner agent                                       │
│  ├─ Review implementation plan (MOST IMPORTANT!)            │
│  └─ Optimize story breakdown for efficiency                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Story Creation                                    │
│  ├─ Run scrum-master agent                                  │
│  ├─ Create user stories (all at once or incrementally)      │
│  └─ Review stories for accuracy                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Execution                                         │
│  ├─ Run developer agent                                     │
│  ├─ Monitor/approve edits                                   │
│  └─ Test implementation                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Success Factors

1. **Thorough Research (Phase 1):** The better your research, the better your plan
2. **Detailed Planning (Phase 2):** The implementation plan is your most critical document
3. **Smart Story Breakdown (Phase 3):** Combine stories intelligently for efficiency
4. **Active Monitoring (Phase 4):** Review AI output while trusting the process you've built

---

## Tips and Best Practices

### When to Combine Stories
- Similar technical domain (e.g., both database scripts)
- Logical dependency between stories
- Both can be tested together
- Neither is overly complex on its own

### When to Split Stories
- Different technical domains (backend vs. frontend)
- Natural testing breakpoints
- Complex features that need focused attention
- When you want tighter control over AI execution

### Review Checkpoints
- **After Research:** Does this give the planner what it needs?
- **After Planning:** Is the technical approach sound? Is the order optimal?
- **After Stories:** Are the acceptance criteria clear? Are technical specs detailed?
- **During Execution:** Is the AI following the story? Do I need to intervene?

---

## Document Generated
Generated from: `training/phase0_requirements/AI_Class.txt`
Date: 2025-10-16