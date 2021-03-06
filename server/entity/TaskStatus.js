import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import i18next from 'i18next';

import IsUnique from '../lib/validators/IsUnique';

@Entity('task_statuses')
class TaskStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', unique: true })
  @IsNotEmpty({ message: () => i18next.t('flash.statuses.validate.notEmpty') })
  @IsUnique({ message: () => i18next.t('flash.statuses.validate.nameIsTaken') })
  name;

  @OneToMany(() => 'Task', (task) => task.status)
  tasks;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

export default TaskStatus;
