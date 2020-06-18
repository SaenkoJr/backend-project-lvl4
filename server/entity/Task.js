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

@Entity('tasks')
class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty()
  name;

  @Column({ type: 'varchar', nullable: true })
  description;

  @ManyToOne(() => 'User', { eager: true, cascade: true })
  creator;

  @ManyToOne(() => 'User', { eager: true, cascade: true })
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
