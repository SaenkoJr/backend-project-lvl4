import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';
import i18next from 'i18next';

import IsUnique from '../lib/validators';

@Entity('users')
class User extends BaseEntity {
  isGuest = false;

  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty({ message: () => i18next.t('flash.users.validate.notEmpty') })
  firstName;

  @Column('varchar')
  @IsNotEmpty({ message: () => i18next.t('flash.users.validate.notEmpty') })
  lastName;

  @Column({ type: 'varchar', unique: true })
  @IsEmail({ message: () => i18next.t('flash.users.validate.isEmail') })
  @IsNotEmpty({ message: () => i18next.t('flash.users.validate.notEmpty') })
  @IsUnique({ message: () => i18next.t('flash.users.validate.emailIsTaken') })
  email;

  @Column({ type: 'varchar' })
  @IsNotEmpty({ message: () => i18next.t('flash.users.validate.notEmpty') })
  passwordDigest;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

export default User;
