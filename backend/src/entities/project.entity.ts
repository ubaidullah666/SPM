import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NgoEntity } from './ngo.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ngo_id' })
  ngoId: number;

  @ManyToOne(() => NgoEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ngo_id' })
  ngo: NgoEntity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location: string | null;

  @Column({ name: 'required_skills', type: 'text', array: true, nullable: true })
  requiredSkills: string[];

  @Column({ name: 'volunteers_needed', type: 'int', default: 1 })
  volunteersNeeded: number;

  @Column({ name: 'volunteers_accepted', type: 'int', default: 0 })
  volunteersAccepted: number;

  @Column({ name: 'total_applications', type: 'int', default: 0 })
  totalApplications: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'application_deadline', type: 'date', nullable: true })
  applicationDeadline: Date | null;

  @Column({ name: 'is_remote', default: false })
  isRemote: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'estimated_hours', type: 'int', default: 0 })
  estimatedHours: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'open',
  })
  status:
    | 'draft'
    | 'open'
    | 'ongoing'
    | 'closed'
    | 'completed'
    | 'cancelled';

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
