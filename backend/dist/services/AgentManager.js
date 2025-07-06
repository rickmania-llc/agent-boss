"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const Logger_1 = require("./Logger");
class AgentManager {
    agents = new Map();
    logger;
    io;
    nextId = 1;
    constructor(io) {
        this.io = io;
        this.logger = new Logger_1.Logger('AgentManager');
    }
    async createAgent(name) {
        const agent = {
            id: this.nextId++,
            name,
            status: 'idle'
        };
        this.agents.set(agent.id, agent);
        this.logger.info(`Created agent: ${name} (ID: ${agent.id})`);
        this.io.emit('agent:created', agent);
        return agent;
    }
    async startAgent(agentId, workItemId) {
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
    async stopAgent(agentId) {
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
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    getAvailableAgent() {
        return Array.from(this.agents.values()).find(agent => agent.status === 'idle');
    }
}
exports.AgentManager = AgentManager;
//# sourceMappingURL=AgentManager.js.map