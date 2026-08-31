import express, { Request, Response } from 'express';
import { NotificationsService } from '../service/NotificationsService';

/**
 * Assumes auth middleware sets req.user { userId, orgId }.
 * Internal calls must supply X-SERVICE-TOKEN header, validated elsewhere.
 */
export function createNotificationsRouter(svc: NotificationsService) {
  const router = express.Router();

  // Internal endpoint: record an audit event
  router.post('/audit', async (req: Request, res: Response) => {
    // service token check (simplified)
    if (req.get('x-service-token') !== process.env.SERVICE_TOKEN) return res.status(403).send('forbidden');

    try {
      const payload = req.body;
      const entry = await svc.recordAudit(payload);
      return res.status(201).json(entry);
    } catch (e:any) {
      if (e.message === 'invalid_event') return res.status(400).json({ error: 'invalid_event' });
      return res.status(500).json({ error: 'internal' });
    }
  });

  // Query audit history by project
  router.get('/audit/:projectId', async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).send('unauthorized');
    const { from, to, eventType } = req.query as any;
    try {
      const entries = await svc.getAuditHistory(req.params.projectId, user.orgId, from, to, eventType);
      return res.json(entries);
    } catch (e) {
      return res.status(500).json({ error: 'internal' });
    }
  });

  router.get('/notifications/:userId', async (req: Request, res: Response) => {
    const jwtUser = (req as any).user;
    if (!jwtUser) return res.status(401).send('unauthorized');
    if (jwtUser.userId !== req.params.userId) return res.status(403).send('forbidden');
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await svc.getUnreadNotifications(req.params.userId);
    return res.json(unreadOnly ? notifications.filter(n=>!n.read) : notifications);
  });

  router.patch('/notifications/:id/read', async (req: Request, res: Response) => {
    const jwtUser = (req as any).user;
    if (!jwtUser) return res.status(401).send('unauthorized');
    try {
      await svc.markNotificationRead(req.params.id, jwtUser.userId);
      return res.json({ id: req.params.id, read: true });
    } catch (e) {
      return res.status(500).json({ error: 'internal' });
    }
  });

  return router;
}
