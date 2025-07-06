import { Request, Response, NextFunction } from 'express';

export async function getAllWorkItems(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    const workItems = await workItemService.getAllWorkItems();
    res.json(workItems);
  } catch (error) {
    next(error);
  }
}

export async function getWorkItem(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    const workItem = await workItemService.getWorkItem(parseInt(req.params.id));
    res.json(workItem);
  } catch (error) {
    next(error);
  }
}

export async function createWorkItem(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    const workItem = await workItemService.createWorkItem(req.body);
    res.status(201).json(workItem);
  } catch (error) {
    next(error);
  }
}

export async function updateWorkItem(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    const workItem = await workItemService.updateWorkItem(parseInt(req.params.id), req.body);
    res.json(workItem);
  } catch (error) {
    next(error);
  }
}

export async function assignWorkItem(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    const { agentId } = req.body;
    await workItemService.assignWorkItemToAgent(parseInt(req.params.id), agentId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function completeWorkItem(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    await workItemService.completeWorkItem(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function failWorkItem(req: Request, res: Response, next: NextFunction) {
  try {
    const workItemService = req.app.locals.services.workItemService;
    await workItemService.failWorkItem(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
