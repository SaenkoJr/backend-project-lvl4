import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('tags')
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'varchar', unique: true })
  @IsNotEmpty()
  name;

  @ManyToMany(() => 'Task', (task) => task.tags)
  tasks;
}

export default Tag;
