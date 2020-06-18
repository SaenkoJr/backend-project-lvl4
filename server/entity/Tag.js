import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('tags')
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id;

  @Column({ type: 'varchar', unique: true })
  @IsNotEmpty()
  name;
}

export default Tag;
