import { DataSource, Repository } from 'typeorm';
import { Project } from '../entity/Project';

/**
 * Thin repository wrapper for testability and DI.
 */
export class ProjectRepository {
  private repo: Repository<Project>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Project);
  }

  create(project: Partial<Project>): Promise<Project> {
    const entity = this.repo.create(project);
    return this.repo.save(entity);
  }

  async findById(orgId: string, id: string): Promise<Project | null> {
    return this.repo.findOne({ where: { id, orgId, deleted: false } });
  }

  async findByTeam(orgId: string, teamId: string): Promise<Project[]> {
    // team relation omitted here — assume projects have teamId in metadata
    return this.repo.find({ where: { orgId, deleted: false } });
  }

  async updateStatus(orgId: string, id: string, patch: Partial<Project>): Promise<Project> {
    const existing = await this.findById(orgId, id);
    if (!existing) throw new Error('NotFound');
    Object.assign(existing, patch);
    return this.repo.save(existing);
  }

  async softDelete(orgId: string, id: string): Promise<void> {
    await this.repo.update({ id, orgId }, { deleted: true });
  }

  async listByOrg(orgId: string): Promise<Project[]> {
    return this.repo.find({ where: { orgId, deleted: false}});
  }
}
