import { ProjectRepository } from '../repository/ProjectRepository';
import { Project } from '../entity/Project';

/**
 * Business logic for Project operations.
 * Enforces tenant isolation by requiring orgId on all methods.
 */
export class ProjectService {
  constructor(private repo: ProjectRepository, private auditClient: { postAudit: (a:any)=>Promise<void> }) {}

  async createProject(orgId: string, userId: string, payload: Partial<Project>): Promise<Project> {
    const project = await this.repo.create({ ...payload, orgId });
    // Write audit entry (best-effort; failures should not prevent creation but must be logged)
    await this.auditClient.postAudit({
      eventType: 'MILESTONE_CREATED',
      entityType: 'project',
      entityId: project.id,
      actor: { userId, orgId },
      prevState: null,
      newState: project,
      createdAt: new Date().toISOString()
    }).catch((e)=>{ /* log but don't block */ });
    return project;
  }

  async getById(orgId: string, id: string): Promise<Project> {
    const p = await this.repo.findById(orgId, id);
    if (!p) throw new Error('NotFound');
    return p;
  }

  async updateStatus(orgId: string, id: string, userId: string, patch: Partial<Project>): Promise<Project> {
    const before = await this.repo.findById(orgId, id);
    if (!before) throw new Error('NotFound');
    const updated = await this.repo.updateStatus(orgId, id, patch);
    await this.auditClient.postAudit({
      eventType: 'MILESTONE_UPDATED',
      entityType: 'project',
      entityId: id,
      actor: { userId, orgId },
      prevState: before,
      newState: updated,
      createdAt: new Date().toISOString()
    }).catch(()=>{});
    return updated;
  }

  async deleteProject(orgId: string, id: string, userId: string): Promise<void> {
    const before = await this.repo.findById(orgId, id);
    if (!before) throw new Error('NotFound');
    await this.repo.softDelete(orgId, id);
    await this.auditClient.postAudit({
      eventType: 'MILESTONE_DELETED',
      entityType: 'project',
      entityId: id,
      actor: { userId, orgId },
      prevState: before,
      newState: null,
      createdAt: new Date().toISOString()
    }).catch(()=>{});
  }
}
