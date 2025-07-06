import { Database } from './Database';
import { AgentManager } from './AgentManager';
import { Logger } from './Logger';

export interface WorkItem {
  id?: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  created_at?: Date;
  updated_at?: Date;
}

export class WorkItemService {
  private logger: Logger;

  constructor(
    private database: Database,
    private agentManager: AgentManager
  ) {
    this.logger = new Logger('WorkItemService');
  }

  async createWorkItem(workItem: Omit<WorkItem, 'id'>): Promise<WorkItem> {
    const [id] = await this.database.getConnection()('work_items').insert(workItem);
    const created = await this.getWorkItem(id);

    this.logger.info(`Created work item: ${created.title} (ID: ${id})`);
    return created;
  }

  async getWorkItem(id: number): Promise<WorkItem> {
    const workItem = await this.database.getConnection()('work_items').where({ id }).first();

    if (!workItem) {
      throw new Error(`Work item ${id} not found`);
    }

    return workItem;
  }

  async getAllWorkItems(): Promise<WorkItem[]> {
    return await this.database.getConnection()('work_items').orderBy('created_at', 'desc');
  }

  async updateWorkItem(id: number, updates: Partial<WorkItem>): Promise<WorkItem> {
    await this.database
      .getConnection()('work_items')
      .where({ id })
      .update({ ...updates, updated_at: new Date() });

    return await this.getWorkItem(id);
  }

  async assignWorkItemToAgent(workItemId: number, agentId: number): Promise<void> {
    const workItem = await this.getWorkItem(workItemId);

    if (workItem.status !== 'pending') {
      throw new Error(`Work item ${workItemId} is not pending`);
    }

    await this.agentManager.startAgent(agentId, workItemId);
    await this.updateWorkItem(workItemId, { status: 'in_progress' });

    this.logger.info(`Assigned work item ${workItemId} to agent ${agentId}`);
  }

  async completeWorkItem(workItemId: number): Promise<void> {
    await this.updateWorkItem(workItemId, { status: 'completed' });
    this.logger.info(`Completed work item ${workItemId}`);
  }

  async failWorkItem(workItemId: number): Promise<void> {
    await this.updateWorkItem(workItemId, { status: 'failed' });
    this.logger.info(`Failed work item ${workItemId}`);
  }
}
