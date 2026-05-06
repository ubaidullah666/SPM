import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ProjectEntity } from './project.entity';

const hoursTransformer = {
  to: (value: number) => value,
  from: (value: string | null) =>
    value === null ? 0 : Number.parseFloat(value),
};

@Entity('contributions')
export class ContributionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ type: 'decimal', precision: 6, scale: 2, transformer: hoursTransformer })
  hours: number;

  @Column({ name: 'impact_score', type: 'int', default: 0 })
  impactScore: number;

  @Column({ name: 'task_description', type: 'text', nullable: true })
  taskDescription: string | null;

  @Column({ name: 'tasks_completed', type: 'text', array: true, nullable: true })
  tasksCompleted: string[] | null;

  @Column({ name: 'contribution_date', type: 'date', default: () => 'CURRENT_DATE' })
  contributionDate: Date;

  @Column({ name: 'verified_by_ngo', default: false })
  verifiedByNgo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
