import express, { Request, Response } from 'express';
import { validateOrReject } from 'class-validator';
import { CreateProjectDTO, UpdateStatusDTO } from '../dto';
import { ProjectService } from '../service/ProjectService';

/**
 * Controller exposes routes with validation and tenant enforcement.
 * Assumes auth middleware sets req.user = { userId, orgId }.
 */
export function createProjectRouter(projectService: ProjectService) {
  const router = express.Router();

  router.post('/', async (req: Request, res: Response) => {
    const dto = Object.assign(new CreateProjectDTO(), req.body);
    try {
      await validateOrReject(dto);
    } catch (err) {
      return res.status(400).json({ error: 'invalid_payload', details: err });
    }
    const user = (req as any).user;
    if (!user) return res.status(401).send('unauthorized');
    const project = await projectService.createProject(user.orgId, user.userId, { name: dto.name, description: dto.description });
    return res.status(201).json(project);
  });

  router.patch('/:id/status', async (req: Request, res: Response) => {
    const dto = Object.assign(new UpdateStatusDTO(), req.body);
    try {
      await validateOrReject(dto);
    } catch (err) {
      return res.status(400).json({ error: 'invalid_payload' });
    }
    const user = (req as any).user;
    try {
      const updated = await projectService.updateStatus(user.orgId, req.params.id, user.userId, { metadata: { status: dto.status }});
      return res.json(updated);
    } catch (e) {
      if ((e as any).message === 'NotFound') return res.status(404).json({ error: 'not_found' });
      return res.status(500).json({ error: 'internal' });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const user = (req as any).user;
    try {
      await projectService.deleteProject(user.orgId, req.params.id, user.userId);
      return res.status(204).send();
    } catch (e) {
      if ((e as any).message === 'NotFound') return res.status(404).json({ error: 'not_found' });
      return res.status(500).json({ error: 'internal' });
    }
  });

  return router;
}
