import { Router } from 'express';
import workItemsRoutes from './workItems.routes';
import agentsRoutes from './agents.routes';
import configRoutes from './config.routes';

const router = Router();

router.use('/work-items', workItemsRoutes);
router.use('/agents', agentsRoutes);
router.use('/config', configRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
