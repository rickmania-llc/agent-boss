"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkItemService = void 0;
const Logger_1 = require("./Logger");
class WorkItemService {
    database;
    agentManager;
    logger;
    constructor(database, agentManager) {
        this.database = database;
        this.agentManager = agentManager;
        this.logger = new Logger_1.Logger('WorkItemService');
    }
    async createWorkItem(workItem) {
        const [id] = await this.database.getConnection()('work_items').insert(workItem);
        const created = await this.getWorkItem(id);
        this.logger.info(`Created work item: ${created.title} (ID: ${id})`);
        return created;
    }
    async getWorkItem(id) {
        const workItem = await this.database.getConnection()('work_items')
            .where({ id })
            .first();
        if (!workItem) {
            throw new Error(`Work item ${id} not found`);
        }
        return workItem;
    }
    async getAllWorkItems() {
        return await this.database.getConnection()('work_items')
            .orderBy('created_at', 'desc');
    }
    async updateWorkItem(id, updates) {
        await this.database.getConnection()('work_items')
            .where({ id })
            .update({ ...updates, updated_at: new Date() });
        return await this.getWorkItem(id);
    }
    async assignWorkItemToAgent(workItemId, agentId) {
        const workItem = await this.getWorkItem(workItemId);
        if (workItem.status !== 'pending') {
            throw new Error(`Work item ${workItemId} is not pending`);
        }
        await this.agentManager.startAgent(agentId, workItemId);
        await this.updateWorkItem(workItemId, { status: 'in_progress' });
        this.logger.info(`Assigned work item ${workItemId} to agent ${agentId}`);
    }
    async completeWorkItem(workItemId) {
        await this.updateWorkItem(workItemId, { status: 'completed' });
        this.logger.info(`Completed work item ${workItemId}`);
    }
    async failWorkItem(workItemId) {
        await this.updateWorkItem(workItemId, { status: 'failed' });
        this.logger.info(`Failed work item ${workItemId}`);
    }
}
exports.WorkItemService = WorkItemService;
//# sourceMappingURL=WorkItemService.js.map