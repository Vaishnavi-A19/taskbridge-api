import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  recipientUserId!: string;

  @Column()
  @Index()
  orgId!: string;

  @Column()
  eventType!: string;

  @Column()
  projectId!: string;

  @Column('text')
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
