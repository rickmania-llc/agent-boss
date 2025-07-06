"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAgents = getAllAgents;
exports.getAgent = getAgent;
exports.createAgent = createAgent;
exports.stopAgent = stopAgent;
async function getAllAgents(req, res, next) {
    try {
        const agentManager = req.app.locals.services.agentManager;
        const agents = agentManager.getAllAgents();
        res.json(agents);
    }
    catch (error) {
        next(error);
    }
}
async function getAgent(req, res, next) {
    try {
        const agentManager = req.app.locals.services.agentManager;
        const agent = agentManager.getAgent(parseInt(req.params.id));
        if (!agent) {
            res.status(404).json({ error: 'Agent not found' });
            return;
        }
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
}
async function createAgent(req, res, next) {
    try {
        const agentManager = req.app.locals.services.agentManager;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        const agent = await agentManager.createAgent(name);
        res.status(201).json(agent);
    }
    catch (error) {
        next(error);
    }
}
async function stopAgent(req, res, next) {
    try {
        const agentManager = req.app.locals.services.agentManager;
        await agentManager.stopAgent(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=agents.controller.js.map