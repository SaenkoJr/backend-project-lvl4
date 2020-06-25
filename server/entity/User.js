import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';
import i18next from 'i18next';

import IsUnique from '../lib/validators/IsUnique';
import Match from '../lib/validators/Match';

@Entity('users')
class User extends BaseEntity {
  isGuest = false;

  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty({ groups: ['registration', 'update'], message: () => i18next.t('flash.users.validate.notEmpty') })
  firstName;

  @Column('varchar')
  @IsNotEmpty({ groups: ['registration', 'update'], message: () => i18next.t('flash.users.validate.notEmpty') })
  lastName;

  @Column({ type: 'varchar', unique: true })
  @IsEmail({
    groups: ['registration', 'update'],
    message: () => i18next.t('flash.users.validate.isEmail'),
  })
  @IsNotEmpty({
    groups: ['registration', 'update'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @IsUnique({
    groups: ['registration', 'update'],
    message: () => i18next.t('flash.users.validate.emailIsTaken'),
  })
  email;

  @IsNotEmpty({
    groups: ['security'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @Match('passwordDigest', {
    groups: ['security'],
    message: () => i18next.t('flash.users.validate.oldPasswordNotMatch'),
  })
  oldPassword;

  @IsNotEmpty({
    groups: ['registration', 'security'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  password;

  @IsNotEmpty({
    groups: ['registration', 'security'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @Match('password', {
    groups: ['registration', 'security'],
    message: () => i18next.t('flash.users.validate.passwordNotMatch'),
  })
  repeatedPassword;

  @Column({ type: 'varchar' })
  @IsNotEmpty({
    groups: ['registration', 'security'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  passwordDigest;

  @OneToMany(() => 'Task', (task) => task.creator)
  createdTasks;

  @OneToMany(() => 'Task', (task) => task.assignedTo)
  assignedTasks;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

export default User;
