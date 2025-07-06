import { Database } from './Database';
import { AgentManager } from './AgentManager';
export interface WorkItem {
    id?: number;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high';
    created_at?: Date;
    updated_at?: Date;
}
export declare class WorkItemService {
    private database;
    private agentManager;
    private logger;
    constructor(database: Database, agentManager: AgentManager);
    createWorkItem(workItem: Omit<WorkItem, 'id'>): Promise<WorkItem>;
    getWorkItem(id: number): Promise<WorkItem>;
    getAllWorkItems(): Promise<WorkItem[]>;
    updateWorkItem(id: number, updates: Partial<WorkItem>): Promise<WorkItem>;
    assignWorkItemToAgent(workItemId: number, agentId: number): Promise<void>;
    completeWorkItem(workItemId: number): Promise<void>;
    failWorkItem(workItemId: number): Promise<void>;
}
//# sourceMappingURL=WorkItemService.d.ts.map