import { Server as SocketIOServer } from 'socket.io';
import { ChildProcess } from 'child_process';
import { Logger } from './Logger';

export interface Agent {
  id: number;
  name: string;
  status: 'idle' | 'busy' | 'error';
  workItemId?: number;
  process?: ChildProcess;
  pid?: number;
}

export class AgentManager {
  private agents: Map<number, Agent> = new Map();
  private logger: Logger;
  private io: SocketIOServer;
  private nextId = 1;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.logger = new Logger('AgentManager');
  }

  async createAgent(name: string): Promise<Agent> {
    const agent: Agent = {
      id: this.nextId++,
      name,
      status: 'idle',
    };

    this.agents.set(agent.id, agent);
    this.logger.info(`Created agent: ${name} (ID: ${agent.id})`);

    this.io.emit('agent:created', agent);
    return agent;
  }

  async startAgent(agentId: number, workItemId: number): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status === 'busy') {
      throw new Error(`Agent ${agentId} is already busy`);
    }

    // TODO: Implement actual Claude Code process spawning
    // For now, we'll simulate it
    agent.status = 'busy';
    agent.workItemId = workItemId;

    this.logger.info(`Started agent ${agentId} on work item ${workItemId}`);
    this.io.emit('agent:started', { agentId, workItemId });
  }

  async stopAgent(agentId: number): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.process) {
      agent.process.kill();
    }

    agent.status = 'idle';
    agent.workItemId = undefined;
    agent.process = undefined;
    agent.pid = undefined;

    this.logger.info(`Stopped agent ${agentId}`);
    this.io.emit('agent:stopped', { agentId });
  }

  getAgent(agentId: number): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAvailableAgent(): Agent | undefined {
    return Array.from(this.agents.values()).find(agent => agent.status === 'idle');
  }
}
