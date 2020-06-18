import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('task_statuses')
class TaskStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', unique: true })
  @IsNotEmpty()
  name;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

export default TaskStatus;
