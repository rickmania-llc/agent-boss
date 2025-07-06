import { Request, Response, NextFunction } from 'express';

export async function getAllAgents(req: Request, res: Response, next: NextFunction) {
  try {
    const agentManager = req.app.locals.services.agentManager;
    const agents = agentManager.getAllAgents();
    res.json(agents);
  } catch (error) {
    next(error);
  }
}

export async function getAgent(req: Request, res: Response, next: NextFunction) {
  try {
    const agentManager = req.app.locals.services.agentManager;
    const agent = agentManager.getAgent(parseInt(req.params.id));

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json(agent);
  } catch (error) {
    next(error);
  }
}

export async function createAgent(req: Request, res: Response, next: NextFunction) {
  try {
    const agentManager = req.app.locals.services.agentManager;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const agent = await agentManager.createAgent(name);
    res.status(201).json(agent);
  } catch (error) {
    next(error);
  }
}

export async function stopAgent(req: Request, res: Response, next: NextFunction) {
  try {
    const agentManager = req.app.locals.services.agentManager;
    await agentManager.stopAgent(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
