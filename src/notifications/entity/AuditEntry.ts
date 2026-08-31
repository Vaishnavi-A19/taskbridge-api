import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'audit_entries' })
export class AuditEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  eventType!: string;

  @Column()
  entityType!: string;

  @Column()
  @Index()
  entityId!: string;

  @Column({ type: 'json' })
  actor!: { userId: string; orgId: string };

  @Column({ type: 'json', nullable: true })
  prevState?: any;

  @Column({ type: 'json' })
  newState!: any;

  @Column({ nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
