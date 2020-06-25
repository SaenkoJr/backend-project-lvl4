import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import i18next from 'i18next';

@Entity('tasks')
class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty({ message: () => i18next.t('flash.tasks.validate.notEmpty') })
  name;

  @Column({ type: 'varchar', nullable: true })
  description;

  @ManyToOne(() => 'User', (user) => user.createdTasks, { eager: true, cascade: true })
  creator;

  @ManyToOne(() => 'User', (user) => user.assignedTasks, { eager: true, cascade: true })
  assignedTo;

  @ManyToOne(() => 'TaskStatus', (status) => status.task, { eager: true, cascade: true })
  status;

  @ManyToMany(() => 'Tag', (tag) => tag.tasks, { eager: true, cascade: true })
  @JoinTable({
    name: 'tasks_tags',
    joinColumn: { name: 'taskId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

export default Task;
