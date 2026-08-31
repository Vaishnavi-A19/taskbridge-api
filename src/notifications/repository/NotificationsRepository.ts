import { DataSource } from 'typeorm';
import { AuditEntry } from '../entity/AuditEntry';
import { Notification } from '../entity/Notification';

export class NotificationsRepository {
  private ds: DataSource;
  constructor(ds: DataSource) { this.ds = ds; }

  getAuditRepo() { return this.ds.getRepository(AuditEntry); }
  getNotificationRepo() { return this.ds.getRepository(Notification); }

  createAudit(a: Partial<AuditEntry>) {
    const r = this.getAuditRepo().create(a);
    return this.getAuditRepo().save(r);
  }

  async findAuditByProject(projectId: string, orgId: string, from?: string, to?: string, eventType?: string) {
    // SQLite doesn't support ->> JSON extraction; fetch by entityId and filter in JS for portability.
    const qb = this.getAuditRepo().createQueryBuilder('a')
      .where('a.entityId = :projectId', { projectId });

    if (eventType) qb.andWhere('a.eventType = :eventType', { eventType });
    if (from) qb.andWhere('a.createdAt >= :from', { from });
    if (to) qb.andWhere('a.createdAt <= :to', { to });

    const rows = await qb.orderBy('a.createdAt', 'DESC').getMany();
    // Filter by actor.orgId in JS to remain DB-agnostic.
    return rows.filter(r => (r.actor && (r.actor as any).orgId) === orgId);
  }

  createNotification(n: Partial<Notification>) {
    const ent = this.getNotificationRepo().create(n);
    return this.getNotificationRepo().save(ent);
  }

  getUnreadNotifications(userId: string) {
    return this.getNotificationRepo().find({ where: { recipientUserId: userId, read: false }});
  }

  markNotificationRead(id: string, userId: string) {
    return this.getNotificationRepo().update({ id, recipientUserId: userId }, { read: true });
  }
}
