import { Router } from 'express';
import * as workItemsController from '../controllers/workItems.controller';

const router = Router();

router.get('/', workItemsController.getAllWorkItems);
router.get('/:id', workItemsController.getWorkItem);
router.post('/', workItemsController.createWorkItem);
router.put('/:id', workItemsController.updateWorkItem);
router.post('/:id/assign', workItemsController.assignWorkItem);
router.post('/:id/complete', workItemsController.completeWorkItem);
router.post('/:id/fail', workItemsController.failWorkItem);

export default router;
