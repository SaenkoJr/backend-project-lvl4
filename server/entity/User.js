import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';

@Entity()
class User extends BaseEntity {
  isGuest = false;

  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty()
  firstName;

  @Column('varchar')
  @IsNotEmpty()
  lastName;

  @Column({ type: 'varchar', unique: true })
  @IsEmail()
  @IsNotEmpty()
  email;

  @Column('varchar')
  @IsNotEmpty()
  passwordDigest;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

export default User;
