import { Server as SocketIOServer } from 'socket.io';
import { ChildProcess } from 'child_process';
export interface Agent {
    id: number;
    name: string;
    status: 'idle' | 'busy' | 'error';
    workItemId?: number;
    process?: ChildProcess;
    pid?: number;
}
export declare class AgentManager {
    private agents;
    private logger;
    private io;
    private nextId;
    constructor(io: SocketIOServer);
    createAgent(name: string): Promise<Agent>;
    startAgent(agentId: number, workItemId: number): Promise<void>;
    stopAgent(agentId: number): Promise<void>;
    getAgent(agentId: number): Agent | undefined;
    getAllAgents(): Agent[];
    getAvailableAgent(): Agent | undefined;
}
//# sourceMappingURL=AgentManager.d.ts.map