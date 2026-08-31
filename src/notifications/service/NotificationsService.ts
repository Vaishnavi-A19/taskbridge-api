import { NotificationsRepository } from '../repository/NotificationsRepository';

/**
 * Handles audit persistence and notification creation.
 * Enforces audit immutability at service level (no update/delete methods).
 */
export class NotificationsService {
  constructor(private repo: NotificationsRepository, private teamService: { getTeamMemberIds: (projectId:string)=>Promise<string[]> }) {}

  async recordAudit(auditPayload: {
    eventType: string; entityType: string; entityId: string;
    actor: { userId: string; orgId: string }; prevState: any; newState: any; ipAddress?: string;
  }) {
    // Validate allowed event types:
    const allowed = new Set(['MILESTONE_CREATED','MILESTONE_UPDATED','MILESTONE_CLOSED','MILESTONE_REOPENED']);
    if (!allowed.has(auditPayload.eventType)) throw new Error('invalid_event');

    // Persist audit (immutable)
    const entry = await this.repo.createAudit({
      eventType: auditPayload.eventType,
      entityType: auditPayload.entityType,
      entityId: auditPayload.entityId,
      actor: auditPayload.actor,
      prevState: auditPayload.prevState,
      newState: auditPayload.newState,
      ipAddress: auditPayload.ipAddress
    });

    // Create notifications
    await this.dispatchNotificationsForEvent(entry);
    return entry;
  }

  private async dispatchNotificationsForEvent(entry: any) {
    // Use teamService to fetch recipients for a project (projectId == entityId)
    const recipients = await this.teamService.getTeamMemberIds(entry.entityId);
    const promises = recipients.map((userId:string) => this.repo.createNotification({
      recipientUserId: userId,
      orgId: entry.actor.orgId,
      eventType: entry.eventType,
      projectId: entry.entityId,
      message: `${entry.eventType} on project ${entry.entityId}`,
      read: false
    }));
    await Promise.all(promises);
  }

  async getAuditHistory(projectId: string, orgId: string, from?: string, to?: string, eventType?: string) {
    return this.repo.findAuditByProject(projectId, orgId, from, to, eventType);
  }

  async getUnreadNotifications(userId: string) {
    return this.repo.getUnreadNotifications(userId);
  }

  async markNotificationRead(id: string, userId: string) {
    await this.repo.markNotificationRead(id, userId);
  }
}
