import { Router } from 'express';
import * as agentsController from '../controllers/agents.controller';

const router = Router();

router.get('/', agentsController.getAllAgents);
router.get('/:id', agentsController.getAgent);
router.post('/', agentsController.createAgent);
router.post('/:id/stop', agentsController.stopAgent);

export default router;
