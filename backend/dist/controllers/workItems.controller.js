"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWorkItems = getAllWorkItems;
exports.getWorkItem = getWorkItem;
exports.createWorkItem = createWorkItem;
exports.updateWorkItem = updateWorkItem;
exports.assignWorkItem = assignWorkItem;
exports.completeWorkItem = completeWorkItem;
exports.failWorkItem = failWorkItem;
async function getAllWorkItems(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        const workItems = await workItemService.getAllWorkItems();
        res.json(workItems);
    }
    catch (error) {
        next(error);
    }
}
async function getWorkItem(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        const workItem = await workItemService.getWorkItem(parseInt(req.params.id));
        res.json(workItem);
    }
    catch (error) {
        next(error);
    }
}
async function createWorkItem(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        const workItem = await workItemService.createWorkItem(req.body);
        res.status(201).json(workItem);
    }
    catch (error) {
        next(error);
    }
}
async function updateWorkItem(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        const workItem = await workItemService.updateWorkItem(parseInt(req.params.id), req.body);
        res.json(workItem);
    }
    catch (error) {
        next(error);
    }
}
async function assignWorkItem(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        const { agentId } = req.body;
        await workItemService.assignWorkItemToAgent(parseInt(req.params.id), agentId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
async function completeWorkItem(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        await workItemService.completeWorkItem(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
async function failWorkItem(req, res, next) {
    try {
        const workItemService = req.app.locals.services.workItemService;
        await workItemService.failWorkItem(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=workItems.controller.js.map