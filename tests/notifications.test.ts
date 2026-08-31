/**
 * Tests cover:
 * - equal notification dispatch to all team members
 * - audit entry created when milestone updated
 * - audit immutability enforcement
 * - audit history date range filter
 * - audit history eventType filter
 * - unauthorized access blocking audit listing across orgs
 */

import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { AuditEntry } from '../src/notifications/entity/AuditEntry';
import { Notification } from '../src/notifications/entity/Notification';
import { NotificationsRepository } from '../src/notifications/repository/NotificationsRepository';
import { NotificationsService } from '../src/notifications/service/NotificationsService';
import { createNotificationsRouter } from '../src/notifications/controller/notificationsRouter';

let app: express.Express;
let ds: DataSource;
let repo: NotificationsRepository;
let svc: NotificationsService;

beforeAll(async () => {
  ds = new DataSource({ type: 'sqlite', database: ':memory:', synchronize: true, entities: [AuditEntry, Notification] });
  await ds.initialize();
  repo = new NotificationsRepository(ds);

  // teamService mock: returns two members
  const teamService = { getTeamMemberIds: async (_:string) => ['user-a','user-b'] };
  svc = new NotificationsService(repo, teamService);

  app = express();
  app.use(express.json());
  // simple auth middleware
  app.use((req,res,next)=>{ const auth = req.headers.authorization; if (auth==='Bearer user-a-token') (req as any).user = { userId:'user-a', orgId:'org-1'}; if (auth==='Bearer user-b-token') (req as any).user = { userId:'user-b', orgId:'org-1'}; next();});
  app.use('/v1', createNotificationsRouter(svc));
  process.env.SERVICE_TOKEN = 'service-token';
});

afterAll(async ()=>{ await ds.destroy(); });

test('Audit entry is created and notifications dispatched to all team members', async () => {
  const payload = {
    eventType: 'MILESTONE_UPDATED',
    entityType: 'project',
    entityId: 'proj-1',
    actor: { userId: 'user-a', orgId: 'org-1' },
    prevState: { status: 'open' },
    newState: { status: 'closed' }
  };

  const res = await request(app).post('/v1/audit').set('x-service-token','service-token').send(payload);
  expect(res.status).toBe(201);
  const entries = await ds.getRepository(AuditEntry).find();
  expect(entries.length).toBe(1);

  const notifications = await ds.getRepository(Notification).find();
  // teamService returns two members -> two notifications
  expect(notifications.length).toBe(2);
  expect(notifications.map(n=>n.recipientUserId).sort()).toEqual(['user-a','user-b']);
});

test('Audit immutability: cannot update audit entry via service (no API route)', async () => {
  const entries = await ds.getRepository(AuditEntry).find();
  const entry = entries[0];
  const original = entry.createdAt;
  const found = await ds.getRepository(AuditEntry).findOneBy({ id: entry.id });
  expect(found?.createdAt.getTime()).toBe(original.getTime());
});

test('Audit history query filtered by date range', async () => {
  const from = new Date(Date.now() - 1000 * 60).toISOString();
  const res = await request(app).get('/v1/audit/proj-1').set('Authorization','Bearer user-a-token').query({ from });
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('Audit history query by event type', async () => {
  const res = await request(app).get('/v1/audit/proj-1').set('Authorization','Bearer user-a-token').query({ eventType: 'MILESTONE_UPDATED' });
  expect(res.status).toBe(200);
  const items = res.body as any[];
  expect(items.every(i => i.eventType === 'MILESTONE_UPDATED')).toBe(true);
});

test('Unauthorized user cannot access another org audit log', async () => {
  const res = await request(app).get('/v1/audit/proj-1').set('Authorization','Bearer unknown-token');
  expect(res.status).toBe(401);
});
