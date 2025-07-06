# Agent Boss - Local Process Architecture

## Executive Summary

The Agent Boss is a lightweight system that manages multiple Claude Code instances as local processes on your development machine. It provides a web interface for managing work items and automatically spawns Claude agents to handle different phases of development work. This document describes the simplified architecture where the orchestrator backend directly spawns and manages Claude Code processes.

## System Overview

### Core Concept

Instead of using containers or complex infrastructure, the orchestrator spawns Claude Code processes directly on your local machine - exactly as if you opened multiple terminal windows and ran `claude code` in each one. This provides a simple, efficient way to parallelize AI-assisted development work.

### Key Features

- Direct process spawning of Claude Code instances
- Web-based management interface
- Real-time progress monitoring
- File-based communication and artifact storage
- Concurrent agent execution with resource limits
- GitLab/GitHub integration for work items

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Your Local Machine                             │
│                                                                         │
│  ┌─────────────────────┐         ┌──────────────────────────────────┐ │
│  │   Web Browser       │         │    Agent Boss Backend            │ │
│  │                     │ HTTP    │                                  │ │
│  │  ┌──────────────┐  │ ◀──────▶ │  ┌────────────────────────────┐ │ │
│  │  │ React UI     │  │         │  │  Express Server           │ │ │
│  │  │              │  │ WS      │  │                            │ │ │
│  │  │ - Work Items │  │ ◀──────▶ │  │  ┌──────────────────────┐ │ │ │
│  │  │ - Progress   │  │         │  │  │ Agent Manager       │ │ │ │
│  │  │ - Artifacts  │  │         │  │  │                      │ │ │ │
│  │  └──────────────┘  │         │  │  │ - Spawns Processes   │ │ │ │
│  └─────────────────────┘         │  │  │ - Tracks State       │ │ │ │
│                                  │  │  │ - Manages Queue      │ │ │ │
│                                  │  │  └──────────────────────┘ │ │ │
│                                  │  │                            │ │ │
│                                  │  │  ┌──────────────────────┐ │ │ │
│                                  │  │  │ Work Item Service    │ │ │ │
│                                  │  │  │                      │ │ │ │
│                                  │  │  │ - GitLab Integration │ │ │ │
│                                  │  │  │ - State Management   │ │ │ │
│                                  │  │  └──────────────────────┘ │ │ │
│                                  │  └────────────────────────────┘ │ │
│                                  │              │                   │ │
│                                  │              │ spawn()          │ │
│                                  │              ▼                   │ │
│  ┌───────────────────────────────────────────────────────────────┐ │ │
│  │                     Claude Code Processes                      │ │ │
│  │                                                                │ │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │ │
│  │  │ Claude      │  │ Claude      │  │ Claude      │          │ │ │
│  │  │ Agent       │  │ Agent       │  │ Agent       │          │ │ │
│  │  │ (Phase 1)   │  │ (Phase 2)   │  │ (Phase 3)   │   ...    │ │ │
│  │  │             │  │             │  │             │          │ │ │
│  │  │ PID: 12345  │  │ PID: 12346  │  │ PID: 12347  │          │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │ │ │
│  └───────────────────────────────────────────────────────────────┘ │ │
│                                                                     │ │
│  ┌───────────────────────────────────────────────────────────────┐ │ │
│  │                    Local File System                           │ │ │
│  │                                                                │ │ │
│  │  ~/.agent-boss/                                               │ │ │
│  │  ├── agents/                                                  │ │ │
│  │  │   ├── phase1-1712345678/  (agent workspaces)              │ │ │
│  │  │   ├── phase1-1712345789/                                  │ │ │
│  │  │   └── phase2-1712345890/                                  │ │ │
│  │  ├── work-items/                                              │ │ │
│  │  │   ├── issue-123/          (work item data)                │ │ │
│  │  │   └── issue-456/                                           │ │ │
│  │  └── database/                                                │ │ │
│  │      └── orchestrator.db     (SQLite)                        │ │ │
│  └───────────────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Backend Server (Node.js/Express)

The backend server is the central orchestrator that manages work items and spawns Claude agents.

```typescript
// server/src/app.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AgentManager } from './services/AgentManager';
import { WorkItemService } from './services/WorkItemService';
import { Database } from './services/Database';

export class OrchestratorServer {
  private app: express.Application;
  private io: Server;
  private agentManager: AgentManager;
  private workItemService: WorkItemService;
  private db: Database;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.app = express();
    const server = createServer(this.app);
    this.io = new Server(server, { cors: { origin: 'http://localhost:3000' } });

    // Initialize services
    this.db = new Database(config.databasePath || '~/.agent-boss/database/orchestrator.db');
    this.agentManager = new AgentManager(this.io);
    this.workItemService = new WorkItemService(this.db, this.agentManager, config);

    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupRoutes() {
    // Work item endpoints
    this.app.post('/api/work-items', async (req, res) => {
      const workItem = await this.workItemService.createFromIssue(req.body.issueId);
      res.json(workItem);
    });

    this.app.post('/api/work-items/:id/start-phase/:phase', async (req, res) => {
      const { id, phase } = req.params;
      const agent = await this.agentManager.startPhase(id, phase);
      res.json({ agentId: agent.id, status: 'started' });
    });

    this.app.get('/api/work-items/:id/artifacts', async (req, res) => {
      const artifacts = await this.workItemService.getArtifacts(req.params.id);
      res.json(artifacts);
    });

    this.app.post('/api/work-items/:id/request-revision', async (req, res) => {
      const revision = await this.workItemService.requestRevision(
        req.params.id,
        req.body.phase,
        req.body.feedback
      );
      res.json(revision);
    });

    // Configuration endpoint
    this.app.get('/api/config', async (req, res) => {
      res.json({
        gitProvider: this.config.gitProvider,
        gitlabUrl: this.config.gitlab?.url,
        githubOwner: this.config.github?.owner,
        githubRepo: this.config.github?.repo,
      });
    });
  }

  private setupWebSocket() {
    this.io.on('connection', socket => {
      console.log('Client connected');

      socket.on('subscribe-work-item', workItemId => {
        socket.join(`work-item-${workItemId}`);
      });

      socket.on('subscribe-agents', () => {
        socket.join('agents');
      });
    });
  }

  async start(port: number = 3001) {
    await this.db.initialize();
    server.listen(port, () => {
      console.log(`Agent Boss running on http://localhost:${port}`);
    });
  }
}
```

### 2. Agent Manager

The Agent Manager is responsible for spawning and monitoring Claude Code processes.

```typescript
// server/src/services/AgentManager.ts
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';
import { Server } from 'socket.io';

interface Agent {
  id: string;
  type: 'phase1' | 'phase2' | 'phase3';
  workItemId: string;
  process: ChildProcess;
  status: 'idle' | 'busy' | 'error';
  startTime: Date;
  workspace: string;
  pid: number;
}

export class AgentManager extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private maxConcurrentAgents = 5;
  private baseDir = path.join(process.env.HOME!, '.agent-boss');

  constructor(private io: Server) {
    super();
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    await fs.mkdir(path.join(this.baseDir, 'agents'), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'work-items'), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'database'), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'logs'), { recursive: true });
  }

  async startPhase(workItemId: string, phase: string): Promise<Agent> {
    // Check if we're at capacity
    const activeAgents = Array.from(this.agents.values()).filter(a => a.status === 'busy');
    if (activeAgents.length >= this.maxConcurrentAgents) {
      throw new Error('Agent capacity reached. Please wait for an agent to finish.');
    }

    // Check if this phase is already running for this work item
    const existingAgent = Array.from(this.agents.values()).find(
      a => a.workItemId === workItemId && a.type === phase && a.status === 'busy'
    );
    if (existingAgent) {
      throw new Error(`Phase ${phase} is already running for this work item`);
    }

    // Create agent
    const agentId = `${phase}-${Date.now()}`;
    const agent = await this.spawnAgent(agentId, phase, workItemId);

    // Broadcast agent status
    this.io.to('agents').emit('agent-started', {
      agentId: agent.id,
      workItemId,
      phase,
      pid: agent.pid,
    });

    return agent;
  }

  private async spawnAgent(agentId: string, phase: string, workItemId: string): Promise<Agent> {
    // Create agent workspace
    const workspace = path.join(this.baseDir, 'agents', agentId);
    await fs.mkdir(workspace, { recursive: true });

    // Prepare task instructions
    await this.prepareAgentWorkspace(workspace, workItemId, phase);

    // Create MCP configuration
    const mcpConfigPath = await this.createMCPConfig(workspace, phase);

    // Log agent start
    console.log(`Spawning Claude agent ${agentId} for ${phase} of ${workItemId}`);

    // Spawn Claude process
    const claudeProcess = spawn(
      'claude',
      ['code', '--workspace', workspace, '--mcp-config', mcpConfigPath],
      {
        cwd: workspace,
        env: {
          ...process.env,
          AI_ORCHESTRATOR_AGENT_ID: agentId,
          AI_ORCHESTRATOR_WORK_ITEM: workItemId,
          AI_ORCHESTRATOR_PHASE: phase,
        },
      }
    );

    // Create agent object
    const agent: Agent = {
      id: agentId,
      type: phase as any,
      workItemId,
      process: claudeProcess,
      status: 'busy',
      startTime: new Date(),
      workspace,
      pid: claudeProcess.pid!,
    };

    // Set up process monitoring
    this.monitorAgent(agent);

    // Store agent
    this.agents.set(agentId, agent);

    return agent;
  }

  private monitorAgent(agent: Agent) {
    const logFile = path.join(this.baseDir, 'logs', `${agent.id}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Monitor stdout for progress
    agent.process.stdout?.on('data', data => {
      const output = data.toString();
      logStream.write(`[STDOUT] ${output}`);

      // Parse progress indicators
      if (output.includes('PROGRESS:')) {
        const progress = this.parseProgress(output);
        this.io.to(`work-item-${agent.workItemId}`).emit('progress', {
          agentId: agent.id,
          phase: agent.type,
          progress,
        });
      }

      // Check for artifact creation
      if (output.includes('ARTIFACT_CREATED:')) {
        const artifactPath = this.parseArtifactPath(output);
        this.handleArtifactCreated(agent, artifactPath);
      }
    });

    // Monitor stderr
    agent.process.stderr?.on('data', data => {
      const error = data.toString();
      logStream.write(`[STDERR] ${error}`);
      console.error(`[${agent.id}] Error: ${error}`);
    });

    // Monitor process exit
    agent.process.on('exit', code => {
      console.log(`Agent ${agent.id} exited with code ${code}`);
      agent.status = code === 0 ? 'idle' : 'error';

      this.io.to('agents').emit('agent-finished', {
        agentId: agent.id,
        exitCode: code,
        duration: Date.now() - agent.startTime.getTime(),
      });

      // Archive agent workspace if successful
      if (code === 0) {
        this.archiveAgentWorkspace(agent);
      }

      logStream.end();
    });
  }

  private async prepareAgentWorkspace(workspace: string, workItemId: string, phase: string) {
    // Copy work item context
    const workItemDir = path.join(this.baseDir, 'work-items', workItemId);

    // Create instructions based on phase
    let instructions = '';

    switch (phase) {
      case 'phase1':
        const contextItems = await this.loadContextItems(workItemId);
        instructions = this.generatePhase1Instructions(workItemId, contextItems);
        break;

      case 'phase2':
        const artifacts = await this.loadPhase1Artifacts(workItemId);
        instructions = this.generatePhase2Instructions(workItemId, artifacts);

        // Copy Phase 1 artifacts to agent workspace
        const phase1Dir = path.join(workItemDir, 'phase1', 'artifacts');
        const contextDir = path.join(workspace, 'context');
        await fs.mkdir(contextDir, { recursive: true });
        await this.copyDirectory(phase1Dir, contextDir);
        break;

      case 'phase3':
        const plan = await this.loadImplementationPlan(workItemId);
        instructions = this.generatePhase3Instructions(workItemId, plan);

        // Copy Phase 2 plan to agent workspace
        const planFile = path.join(workItemDir, 'phase2', 'implementation-plan.md');
        await fs.copyFile(planFile, path.join(workspace, 'implementation-plan.md'));
        break;
    }

    // Write instructions
    await fs.writeFile(path.join(workspace, 'INSTRUCTIONS.md'), instructions);

    // Create output directories
    await fs.mkdir(path.join(workspace, 'artifacts'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'output'), { recursive: true });
  }

  private generatePhase1Instructions(workItemId: string, contextItems: any[]): string {
    return `# Phase 1: Research and Context Building

## Work Item ID: ${workItemId}

## Your Task
You are a research specialist analyzing a codebase to understand specific aspects of the system.

## Context Items to Analyze
${contextItems
  .map(
    (item, index) => `
### ${index + 1}. ${item.description}

Please:
1. Navigate to the relevant codebase and branch
2. Deeply analyze the code structure and patterns
3. Understand the business logic and technical implementation
4. Document integration points and dependencies
5. Create a comprehensive artifact named \`context-${index + 1}-analysis.md\`

Focus on:
- Architecture patterns and design decisions
- Data flow and system interactions
- API contracts and interfaces
- Testing strategies
- Performance considerations
`
  )
  .join('\n')}

## Output Requirements
- Save all artifacts to the \`./artifacts\` directory
- Use clear markdown formatting with sections
- Include code examples where relevant
- Create diagrams for complex flows (save as .svg or .png)
- Highlight potential challenges or technical debt

## Progress Reporting
Use the MCP tool \`report_progress\` to update your progress as you complete each context item.

## When Complete
Once all context items have been analyzed and artifacts created, your work is done.
The orchestrator will automatically detect completion when you exit.
`;
  }

  private generatePhase2Instructions(workItemId: string, artifacts: string[]): string {
    return `# Phase 2: Implementation Planning

## Work Item ID: ${workItemId}

## Your Task
Create a detailed implementation plan based on the research from Phase 1.

## Available Context
The following Phase 1 artifacts are available in the \`./context\` directory:
${artifacts.map(a => `- ${a}`).join('\n')}

## Requirements
1. Review all Phase 1 artifacts thoroughly
2. Create a comprehensive implementation plan that includes:
   - Step-by-step implementation tasks
   - Specific files to modify or create
   - Exact code changes needed
   - Order of implementation
   - Testing requirements
   - Documentation updates needed

## Plan Structure
Your implementation plan should include:

### Overview
- Summary of the changes needed
- High-level approach

### Implementation Steps
For each step:
- Task description
- Files affected
- Code changes (with snippets)
- Dependencies
- Estimated effort

### Testing Strategy
- Unit tests needed
- Integration tests
- Manual testing steps

### Risk Assessment
- Potential challenges
- Mitigation strategies

### Documentation Updates
- CLAUDE.md files to update
- README changes
- API documentation

## Output
Save your implementation plan as \`./artifacts/implementation-plan.md\`

## Progress Reporting
Use the MCP tool \`report_progress\` to update your progress through the planning process.
`;
  }

  private generatePhase3Instructions(workItemId: string, plan: any): string {
    return `# Phase 3: Implementation

## Work Item ID: ${workItemId}

## Your Task
Execute the implementation plan created in Phase 2.

## Implementation Plan
The plan is available at \`./implementation-plan.md\`

## Process
1. Pull the designated branch from the repository
2. Create a new feature branch following the naming convention: \`feature/${workItemId}-description\`
3. Implement each step from the plan
4. Update all CLAUDE.md documentation as specified
5. Run tests to ensure everything works
6. Commit your changes with clear messages
7. Push the branch
8. Create a merge/pull request

## Git Operations
Use the MCP git operations tool for:
- Checking out branches
- Creating new branches
- Committing changes
- Pushing to remote

## Important
- Follow the project's coding standards
- Ensure all tests pass before pushing
- Update documentation inline with code changes
- Use descriptive commit messages

## Output
- All code changes implemented and pushed
- Merge request URL saved to \`./artifacts/merge-request.txt\`
- Summary of changes saved to \`./artifacts/implementation-summary.md\`

## Progress Reporting
Report progress after each major step of the implementation.
`;
  }

  private async createMCPConfig(workspace: string, phase: string): Promise<string> {
    const config = {
      servers: {
        filesystem: {
          command: 'mcp-server-filesystem',
          args: ['--workspace', workspace],
        },
        gitlab: {
          command: 'mcp-server-gitlab',
          args: ['--token', process.env.GITLAB_TOKEN],
        },
        orchestrator: {
          command: path.join(__dirname, '../../mcp-servers/orchestrator-mcp'),
          args: ['--agent-workspace', workspace],
        },
      },
    };

    // Add phase-specific servers
    if (phase === 'phase3') {
      config.servers['git-operations'] = {
        command: 'mcp-server-git',
        args: ['--repo-path', workspace],
      };
    }

    const configPath = path.join(workspace, 'mcp-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return configPath;
  }

  private async archiveAgentWorkspace(agent: Agent) {
    const workItemDir = path.join(this.baseDir, 'work-items', agent.workItemId, agent.type);
    await fs.mkdir(workItemDir, { recursive: true });

    // Copy artifacts
    const artifactsSource = path.join(agent.workspace, 'artifacts');
    const artifactsDest = path.join(workItemDir, 'artifacts');
    await this.copyDirectory(artifactsSource, artifactsDest);

    // Create summary
    const summary = {
      agentId: agent.id,
      phase: agent.type,
      startTime: agent.startTime,
      endTime: new Date(),
      duration: Date.now() - agent.startTime.getTime(),
      workspace: agent.workspace,
      artifacts: await fs.readdir(artifactsSource),
    };

    await fs.writeFile(path.join(workItemDir, 'summary.json'), JSON.stringify(summary, null, 2));

    // Optionally clean up agent workspace after a delay
    setTimeout(
      async () => {
        if (this.agents.get(agent.id)?.status !== 'busy') {
          await fs.rm(agent.workspace, { recursive: true, force: true });
          this.agents.delete(agent.id);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes
  }

  async getActiveAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(a => a.status === 'busy');
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.process.kill('SIGTERM');
      agent.status = 'idle';
    }
  }
}
```

### 3. Work Item Service

Manages work items and their lifecycle with support for both GitHub and GitLab.

```typescript
// server/src/services/WorkItemService.ts
import { Database } from './Database';
import { GitLabClient } from '../clients/GitLabClient';
import { GitHubClient } from '../clients/GitHubClient';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface WorkItem {
  id: string;
  sourceType: 'gitlab' | 'github';
  sourceIssueId: string;
  sourceIssueUrl: string;
  projectId: string;
  title: string;
  description: string;
  contextItems: ContextItem[];
  state: WorkItemState;
  createdAt: Date;
  updatedAt: Date;
  phases: {
    phase1?: PhaseStatus;
    phase2?: PhaseStatus;
    phase3?: PhaseStatus;
  };
}

export interface ContextItem {
  id: string;
  description: string;
  type: 'codebase_analysis' | 'integration_study' | 'architecture_review';
  status: 'pending' | 'in_progress' | 'complete';
}

export class WorkItemService {
  private gitlab?: GitLabClient;
  private github?: GitHubClient;
  private gitProvider: 'gitlab' | 'github';
  private baseDir = path.join(process.env.HOME!, '.agent-boss', 'work-items');

  constructor(
    private db: Database,
    private agentManager: AgentManager,
    private config: {
      gitProvider: 'gitlab' | 'github';
      gitlab?: {
        url: string;
        token: string;
      };
      github?: {
        token: string;
        owner: string;
        repo: string;
      };
    }
  ) {
    this.gitProvider = config.gitProvider;

    if (config.gitProvider === 'gitlab' && config.gitlab) {
      this.gitlab = new GitLabClient(config.gitlab.url, config.gitlab.token);
    } else if (config.gitProvider === 'github' && config.github) {
      this.github = new GitHubClient(config.github.token, config.github.owner, config.github.repo);
    }
  }

  async createFromIssue(issueId: string): Promise<WorkItem> {
    let issue: any;
    let sourceIssueUrl: string;
    let projectId: string;

    // Fetch issue from appropriate provider
    if (this.gitProvider === 'gitlab' && this.gitlab) {
      issue = await this.gitlab.getIssue(issueId);
      sourceIssueUrl = issue.web_url;
      projectId = issue.project_id;
    } else if (this.gitProvider === 'github' && this.github) {
      issue = await this.github.getIssue(issueId);
      sourceIssueUrl = issue.html_url;
      projectId = `${this.config.github!.owner}/${this.config.github!.repo}`;
    } else {
      throw new Error('Git provider not configured');
    }

    // Parse context items from issue description
    const contextItems = this.parseContextItems(issue.body || issue.description);

    // Create work item
    const workItem: WorkItem = {
      id: this.generateId(),
      sourceType: this.gitProvider,
      sourceIssueId: issueId,
      sourceIssueUrl,
      projectId,
      title: issue.title,
      description: issue.body || issue.description,
      contextItems,
      state: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      phases: {},
    };

    // Save to database
    await this.db.saveWorkItem(workItem);

    // Create file system structure
    await this.createWorkItemDirectories(workItem.id);

    // Save metadata
    await this.saveWorkItemMetadata(workItem);

    return workItem;
  }

  private parseContextItems(description: string): ContextItem[] {
    const contextSection = description.match(/## Context Items\n([\s\S]*?)(?=\n##|$)/);
    if (!contextSection) return [];

    const items: ContextItem[] = [];
    const lines = contextSection[1].split('\n');

    for (const line of lines) {
      const match = line.match(/^\s*-\s+(.+)$/);
      if (match) {
        items.push({
          id: this.generateId(),
          description: match[1].trim(),
          type: this.inferContextType(match[1]),
          status: 'pending',
        });
      }
    }

    return items;
  }

  private inferContextType(description: string): ContextItem['type'] {
    if (description.toLowerCase().includes('architecture')) {
      return 'architecture_review';
    } else if (description.toLowerCase().includes('integration')) {
      return 'integration_study';
    } else {
      return 'codebase_analysis';
    }
  }

  async getArtifacts(workItemId: string): Promise<any[]> {
    const artifacts: any[] = [];
    const workItemDir = path.join(this.baseDir, workItemId);

    // Check each phase for artifacts
    for (const phase of ['phase1', 'phase2', 'phase3']) {
      const artifactsDir = path.join(workItemDir, phase, 'artifacts');
      try {
        const files = await fs.readdir(artifactsDir);
        for (const file of files) {
          const content = await fs.readFile(path.join(artifactsDir, file), 'utf-8');
          artifacts.push({
            phase,
            filename: file,
            content,
            path: path.join(phase, 'artifacts', file),
          });
        }
      } catch (error) {
        // Phase might not exist yet
      }
    }

    return artifacts;
  }

  async requestRevision(workItemId: string, phase: string, feedback: any): Promise<any> {
    const revision = {
      id: this.generateId(),
      workItemId,
      phase,
      feedback,
      requestedAt: new Date(),
      status: 'pending',
    };

    await this.db.saveRevision(revision);

    // Update work item state
    await this.updateWorkItemState(workItemId, `${phase}_revision`);

    return revision;
  }

  private async createWorkItemDirectories(workItemId: string) {
    const dirs = [
      path.join(this.baseDir, workItemId),
      path.join(this.baseDir, workItemId, 'phase1'),
      path.join(this.baseDir, workItemId, 'phase2'),
      path.join(this.baseDir, workItemId, 'phase3'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 4. Git Provider Clients

Support for both GitLab and GitHub APIs.

````typescript
// server/src/clients/GitLabClient.ts
import axios from 'axios';

export class GitLabClient {
  private api: any;

  constructor(private baseUrl: string, private token: string) {
    this.api = axios.create({
      baseURL: `${baseUrl}/api/v4`,
      headers: {
        'PRIVATE-TOKEN': token
      }
    });
  }

  async getIssue(issueId: string): Promise<any> {
    // issueId format: "projectId/issueNumber" or just "issueNumber" if projectId is in config
    const response = await this.api.get(`/issues/${issueId}`);
    return response.data;
  }

  async createMergeRequest(projectId: string, params: any): Promise<any> {
    const response = await this.api.post(`/projects/${projectId}/merge_requests`, params);
    return response.data;
  }

  async updateIssue(issueId: string, updates: any): Promise<any> {
    const response = await this.api.put(`/issues/${issueId}`, updates);
    return response.data;
  }

  async addComment(issueId: string, comment: string): Promise<any> {
    const response = await this.api.post(`/issues/${issueId}/notes`, { body: comment });
    return response.data;
  }
}

// server/src/clients/GitHubClient.ts
import { Octokit } from '@octokit/rest';

export class GitHubClient {
  private octokit: Octokit;

  constructor(private token: string, private owner: string, private repo: string) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  async getIssue(issueNumber: string): Promise<any> {
    const response = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(issueNumber)
    });
    return response.data;
  }

  async createPullRequest(params: any): Promise<any> {
    const response = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      ...params
    });
    return response.data;
  }

  async updateIssue(issueNumber: string, updates: any): Promise<any> {
    const response = await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(issueNumber),
      ...updates
    });
    return response.data;
  }

  async addComment(issueNumber: string, comment: string): Promise<any> {
    const response = await this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(issueNumber),
      body: comment
    });
    return response.data;
  }
}

Custom MCP server for agent-orchestrator communication.

```typescript
// mcp-servers/orchestrator-mcp/src/index.ts
import { MCPServer } from '@modelcontextprotocol/server';
import * as fs from 'fs/promises';
import * as path from 'path';

export class OrchestratorMCPServer extends MCPServer {
  private agentWorkspace: string;

  constructor(args: string[]) {
    super();
    this.agentWorkspace = this.parseArgs(args)['--agent-workspace'];
    this.registerTools();
  }

  private registerTools() {
    // Tool for saving artifacts
    this.registerTool('save_artifact', async (params) => {
      const { name, content, type } = params;
      const artifactPath = path.join(this.agentWorkspace, 'artifacts', name);

      await fs.mkdir(path.dirname(artifactPath), { recursive: true });
      await fs.writeFile(artifactPath, content);

      // Notify orchestrator via stdout
      console.log(`ARTIFACT_CREATED: ${artifactPath}`);

      return {
        success: true,
        path: artifactPath
      };
    });

    // Tool for reporting progress
    this.registerTool('report_progress', async (params) => {
      const { phase, step, total, message } = params;

      // Output progress in parseable format
      console.log(`PROGRESS: ${JSON.stringify({
        phase,
        step,
        total,
        message,
        percentage: Math.round((step / total) * 100)
      })}`);

      return { success: true };
    });

    // Tool for accessing work item data
    this.registerTool('get_work_item_data', async (params) => {
      const workItemId = process.env.AI_ORCHESTRATOR_WORK_ITEM;
      const { dataType } = params;

      const dataPath = path.join(
        process.env.HOME!,
        '.agent-boss',
        'work-items',
        workItemId!,
        `${dataType}.json`
      );

      try {
        const data = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        return { error: `Failed to load ${dataType} data` };
      }
    });

    // Tool for loading previous phase artifacts
    this.registerTool('load_phase_artifacts', async (params) => {
      const workItemId = process.env.AI_ORCHESTRATOR_WORK_ITEM;
      const { phase } = params;

      const artifactsDir = path.join(
        process.env.HOME!,
        '.agent-boss',
        'work-items',
        workItemId!,
        phase,
        'artifacts'
      );

      try {
        const files = await fs.readdir(artifactsDir);
        const artifacts: any[] = [];

        for (const file of files) {
          const content = await fs.readFile(path.join(artifactsDir, file), 'utf-8');
          artifacts.push({
            filename: file,
            content
          });
        }

        return { artifacts };
      } catch (error) {
        return { error: `Failed to load ${phase} artifacts` };
      }
    });
  }
}

// Start the server
if (require.main === module) {
  const server = new OrchestratorMCPServer(process.argv.slice(2));
  server.start();
}
````

## Frontend React Application

### Main Dashboard

```typescript
// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { WorkItemDetail } from './pages/WorkItemDetail';
import { AgentMonitor } from './pages/AgentMonitor';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Agent Boss</h1>
          <div className="nav-links">
            <a href="/">Dashboard</a>
            <a href="/agents">Agents</a>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/work-items/:id" element={<WorkItemDetail />} />
          <Route path="/agents" element={<AgentMonitor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

### Work Item Detail Page

```typescript
// frontend/src/pages/WorkItemDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { WorkItem, Agent, Progress } from '../types';

export function WorkItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Load work item
    fetchWorkItem();

    // Connect to WebSocket
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Subscribe to updates
    newSocket.emit('subscribe-work-item', id);

    // Listen for progress updates
    newSocket.on('progress', (data) => {
      setProgress(prev => ({
        ...prev,
        [data.agentId]: data.progress
      }));
    });

    // Listen for agent updates
    newSocket.on('agent-started', (data) => {
      if (data.workItemId === id) {
        setAgents(prev => [...prev, data]);
      }
    });

    newSocket.on('agent-finished', (data) => {
      setAgents(prev => prev.map(a =>
        a.agentId === data.agentId
          ? { ...a, status: 'finished', duration: data.duration }
          : a
      ));
      // Reload artifacts
      fetchArtifacts();
    });

    return () => {
      newSocket.close();
    };
  }, [id]);

  const fetchWorkItem = async () => {
    const response = await fetch(`/api/work-items/${id}`);
    const data = await response.json();
    setWorkItem(data);
  };

  const fetchArtifacts = async () => {
    const response = await fetch(`/api/work-items/${id}/artifacts`);
    const data = await response.json();
    setArtifacts(data);
  };

  const startPhase = async (phase: string) => {
    try {
      const response = await fetch(
        `/api/work-items/${id}/start-phase/${phase}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
      }

      const { agentId } = await response.json();

      // Update UI to show agent started
      setAgents(prev => [...prev, {
        id: agentId,
        phase,
        status: 'running',
        startTime: new Date()
      }]);
    } catch (error) {
      console.error('Failed to start phase:', error);
      alert('Failed to start phase');
    }
  };

  const requestRevision = async (phase: string) => {
    const feedback = prompt('Enter revision feedback:');
    if (!feedback) return;

    const response = await fetch(`/api/work-items/${id}/request-revision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase, feedback })
    });

    const revision = await response.json();
    alert('Revision requested successfully');
  };

  if (!workItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="work-item-detail">
      <header>
        <h1>{workItem.title}</h1>
        <div className="issue-link">
          GitLab Issue: #{workItem.gitlabIssueId}
        </div>
      </header>

      <section className="context-items">
        <h2>Context Items</h2>
        <ul>
          {workItem.contextItems.map(item => (
            <li key={item.id} className={`status-${item.status}`}>
              <span className="type">{item.type}</span>
              <span className="description">{item.description}</span>
              <span className="status">{item.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="phase-controls">
        <h2>Phases</h2>
        <div className="phase-buttons">
          <div className="phase">
            <h3>Phase 1: Research</h3>
            <button
              onClick={() => startPhase('phase1')}
              disabled={agents.some(a => a.phase === 'phase1' && a.status === 'running')}
            >
              Start Research
            </button>
            <button onClick={() => requestRevision('phase1')}>
              Request Revision
            </button>
          </div>

          <div className="phase">
            <h3>Phase 2: Planning</h3>
            <button
              onClick={() => startPhase('phase2')}
              disabled={
                !artifacts.some(a => a.phase === 'phase1') ||
                agents.some(a => a.phase === 'phase2' && a.status === 'running')
              }
            >
              Start Planning
            </button>
            <button onClick={() => requestRevision('phase2')}>
              Request Revision
            </button>
          </div>

          <div className="phase">
            <h3>Phase 3: Implementation</h3>
            <button
              onClick={() => startPhase('phase3')}
              disabled={
                !artifacts.some(a => a.phase === 'phase2') ||
                agents.some(a => a.phase === 'phase3' && a.status === 'running')
              }
            >
              Start Implementation
            </button>
            <button onClick={() => requestRevision('phase3')}>
              Request Revision
            </button>
          </div>
        </div>
      </section>

      <section className="active-agents">
        <h2>Active Agents</h2>
        <div className="agents-grid">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              progress={progress[agent.id]}
            />
          ))}
        </div>
      </section>

      <section className="artifacts">
        <h2>Artifacts</h2>
        <div className="artifacts-list">
          {artifacts.map((artifact, index) => (
            <ArtifactCard key={index} artifact={artifact} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AgentCard({ agent, progress }: { agent: Agent; progress?: Progress }) {
  return (
    <div className={`agent-card status-${agent.status}`}>
      <h4>{agent.id}</h4>
      <div className="agent-info">
        <span>Phase: {agent.phase}</span>
        <span>Status: {agent.status}</span>
        <span>PID: {agent.pid}</span>
      </div>
      {progress && (
        <div className="progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="progress-message">{progress.message}</span>
        </div>
      )}
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: any }) {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="artifact-card">
      <div className="artifact-header" onClick={() => setShowContent(!showContent)}>
        <h4>{artifact.filename}</h4>
        <span className="phase-tag">{artifact.phase}</span>
      </div>
      {showContent && (
        <pre className="artifact-content">{artifact.content}</pre>
      )}
    </div>
  );
}
```

## File System Layout

```
~/.agent-boss/
├── agents/                          # Active agent workspaces
│   ├── phase1-1712345678/
│   │   ├── INSTRUCTIONS.md         # Generated task instructions
│   │   ├── mcp-config.json         # MCP server configuration
│   │   ├── artifacts/              # Agent output
│   │   │   ├── context-1-analysis.md
│   │   │   ├── context-2-analysis.md
│   │   │   └── architecture-diagram.svg
│   │   └── output/                 # Working directory
│   │
│   ├── phase2-1712345789/
│   │   ├── INSTRUCTIONS.md
│   │   ├── mcp-config.json
│   │   ├── context/                # Copied from Phase 1
│   │   │   └── *.md
│   │   └── artifacts/
│   │       └── implementation-plan.md
│   │
│   └── phase3-1712345890/
│       ├── INSTRUCTIONS.md
│       ├── mcp-config.json
│       ├── implementation-plan.md  # Copied from Phase 2
│       └── artifacts/
│           ├── merge-request.txt
│           └── implementation-summary.md
│
├── work-items/                     # Persistent work item data
│   ├── issue-123/
│   │   ├── metadata.json          # Work item details
│   │   ├── context-items.json     # Parsed from issue
│   │   ├── phase1/
│   │   │   ├── artifacts/         # Archived from agent
│   │   │   └── summary.json       # Phase completion info
│   │   ├── phase2/
│   │   │   ├── artifacts/
│   │   │   └── summary.json
│   │   └── phase3/
│   │       ├── artifacts/
│   │       └── summary.json
│   │
│   └── issue-456/
│       └── ... (same structure)
│
├── database/
│   └── orchestrator.db            # SQLite database
│
├── logs/
│   ├── orchestrator.log          # Main server log
│   ├── phase1-1712345678.log     # Individual agent logs
│   ├── phase2-1712345789.log
│   └── phase3-1712345890.log
│
└── config/
    └── settings.json             # User preferences
```

## Process Flow Examples

### Starting a New Work Item

1. **User Action**: Enters GitLab issue ID in UI
2. **Backend**:
   - Fetches issue from GitLab API
   - Parses context items from description
   - Creates work item in database
   - Sets up directory structure
3. **Response**: Work item details displayed in UI

### Running Phase 1 (Research)

1. **User Action**: Clicks "Start Research" button
2. **Backend**:
   - Checks agent capacity
   - Creates agent workspace
   - Generates Phase 1 instructions
   - Spawns Claude Code process
   - Starts monitoring stdout/stderr
3. **Claude Agent**:
   - Reads instructions
   - Analyzes each context item
   - Creates artifacts using MCP tools
   - Reports progress
4. **Real-time Updates**:
   - Progress sent via WebSocket
   - UI updates progress bars
5. **Completion**:
   - Agent exits
   - Artifacts archived to work item directory
   - UI shows completion status

### Handling Concurrent Agents

```typescript
// Example: Two users start different work items simultaneously

// User A starts Phase 1 for issue-123
POST /api/work-items/issue-123/start-phase/phase1
→ Spawns process: claude [PID: 12345]
→ Workspace: ~/.agent-boss/agents/phase1-1712345678/

// User B starts Phase 1 for issue-456
POST /api/work-items/issue-456/start-phase/phase1
→ Spawns process: claude [PID: 12346]
→ Workspace: ~/.agent-boss/agents/phase1-1712345789/

// Both agents run independently with isolated workspaces
// AgentManager tracks both processes
// Progress updates stream to respective work items
```

## Configuration and Setup

### Configuration File

Create a configuration file for the orchestrator:

```javascript
// config/orchestrator.config.js
module.exports = {
  // Git provider configuration
  gitProvider: process.env.GIT_PROVIDER || 'github', // 'github' or 'gitlab'

  // GitHub configuration
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    // Optional: GitHub Enterprise URL
    baseUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
  },

  // GitLab configuration
  gitlab: {
    url: process.env.GITLAB_URL || 'https://gitlab.com',
    token: process.env.GITLAB_TOKEN,
    // Optional: Default project ID for issues
    defaultProjectId: process.env.GITLAB_PROJECT_ID,
  },

  // Agent configuration
  agents: {
    maxConcurrent: parseInt(process.env.MAX_AGENTS) || 5,
    timeout: parseInt(process.env.AGENT_TIMEOUT) || 3600000, // 1 hour
    archiveDelay: parseInt(process.env.ARCHIVE_DELAY) || 300000, // 5 minutes
  },

  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 3001,
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
  },

  // Database configuration
  database: {
    path: process.env.DB_PATH || '~/.agent-boss/database/orchestrator.db',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || '~/.agent-boss/logs',
  },
};
```

### Environment Variables

Create a `.env` file:

```bash
# Git Provider Selection
GIT_PROVIDER=github  # or 'gitlab'

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_OWNER=your-org-or-username
GITHUB_REPO=your-repo-name
# GITHUB_API_URL=https://github.enterprise.com/api/v3  # For GitHub Enterprise

# GitLab Configuration
GITLAB_URL=https://gitlab.com  # or your self-hosted GitLab
GITLAB_TOKEN=glpat-your_gitlab_token_here
# GITLAB_PROJECT_ID=12345  # Optional default project

# Agent Configuration
MAX_AGENTS=5
AGENT_TIMEOUT=3600000
ARCHIVE_DELAY=300000

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DB_PATH=~/.agent-boss/database/orchestrator.db

# Logging
LOG_LEVEL=info
LOG_DIR=~/.agent-boss/logs
```

### Starting the Server

```javascript
// server/src/index.ts
import { OrchestratorServer } from './app';
import config from '../config/orchestrator.config';

interface OrchestratorConfig {
  gitProvider: 'github' | 'gitlab';
  github?: {
    token: string;
    owner: string;
    repo: string;
    baseUrl?: string;
  };
  gitlab?: {
    url: string;
    token: string;
    defaultProjectId?: string;
  };
  agents: {
    maxConcurrent: number;
    timeout: number;
    archiveDelay: number;
  };
  server: {
    port: number;
    cors: {
      origin: string;
    };
  };
  database: {
    path: string;
  };
  logging: {
    level: string;
    directory: string;
  };
}

// Validate configuration
function validateConfig(config: OrchestratorConfig) {
  if (config.gitProvider === 'github' && !config.github?.token) {
    throw new Error('GitHub token is required when using GitHub provider');
  }

  if (config.gitProvider === 'gitlab' && !config.gitlab?.token) {
    throw new Error('GitLab token is required when using GitLab provider');
  }

  console.log(`Starting AI Orchestrator with ${config.gitProvider} integration`);
}

// Start server
async function start() {
  try {
    validateConfig(config);

    const server = new OrchestratorServer(config);
    await server.start(config.server.port);

    console.log(`
      🚀 Agent Boss Started

      Git Provider: ${config.gitProvider}
      API URL: http://localhost:${config.server.port}
      Frontend URL: ${config.server.cors.origin}
      Max Agents: ${config.agents.maxConcurrent}

      ${config.gitProvider === 'github'
        ? `GitHub: ${config.github.owner}/${config.github.repo}`
        : `GitLab: ${config.gitlab.url}`
      }
    `);
  } catch (error) {
    console.error('Failed to start Agent Boss:', error);
    process.exit(1);
  }
}

start();
```

## Security Considerations

1. **Process Isolation**: Each agent runs in its own workspace
2. **Token Management**: GitLab tokens stored in environment variables
3. **File Permissions**: Agent workspaces created with user-only permissions
4. **Process Limits**: Maximum concurrent agents prevents resource exhaustion
5. **Cleanup**: Automatic archival and cleanup of agent workspaces

## Monitoring and Debugging

### Viewing Agent Logs

```bash
# Real-time log monitoring
tail -f ~/.agent-boss/logs/phase1-1712345678.log

# View all agent processes
ps aux | grep claude

# Check agent workspace
ls -la ~/.agent-boss/agents/
```

### Debug Mode

Set environment variable for verbose logging:

```bash
AGENT_BOSS_DEBUG=true npm start
```

## Benefits of This Architecture

1. **Simplicity**: No Docker, Kubernetes, or complex infrastructure
2. **Direct Control**: Claude runs as normal OS processes
3. **Easy Debugging**: Direct access to process stdout/stderr
4. **Resource Efficiency**: No containerization overhead
5. **Natural Claude Usage**: Uses Claude Code as designed
6. **Immediate Feedback**: Real-time progress updates
7. **Flexible Scaling**: Spawn more processes as needed
8. **Local Development**: Everything runs on your machine

## Future Enhancements

1. **Remote Agent Support**: Run agents on other machines via SSH
2. **Agent Templates**: Predefined configurations for common tasks
3. **Batch Processing**: Queue multiple work items
4. **Integration Expansion**: Support for Bitbucket, Azure DevOps, etc.
5. **Plugin System**: Custom MCP servers for specific workflows
6. **Agent Pooling**: Reuse agents for similar tasks
7. **Cost Tracking**: Monitor API usage per work item

## Conclusion

This architecture provides a clean, efficient way to orchestrate multiple Claude Code agents for parallel development work. By leveraging simple process spawning and file-based communication, it maintains the flexibility and power of Claude Code while adding the orchestration layer needed for complex, multi-phase development workflows.
