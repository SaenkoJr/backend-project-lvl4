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
import IsMatch from '../lib/validators/IsMatch';
import IsExist from '../lib/validators/IsExist';
import IsPasswordCorrect from '../lib/validators/IsPasswordCorrect';

@Entity('users')
class User extends BaseEntity {
  isGuest = false;

  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty({
    groups: ['registration', 'update'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  firstName;

  @Column('varchar')
  @IsNotEmpty({
    groups: ['registration', 'update'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  lastName;

  @Column({ type: 'varchar', unique: true })
  @IsEmail({
    groups: ['registration', 'update', 'signIn'],
    message: () => i18next.t('flash.users.validate.isEmail'),
  })
  @IsNotEmpty({
    groups: ['registration', 'update', 'signIn'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @IsUnique({
    groups: ['registration', 'update'],
    message: () => i18next.t('flash.users.validate.emailIsTaken'),
  })
  @IsExist({
    groups: ['signIn'],
    message: () => i18next.t('flash.users.validate.emailIsNotFound'),
  })
  email;

  @IsNotEmpty({
    groups: ['security'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @IsMatch('passwordDigest', {
    groups: ['security'],
    message: () => i18next.t('flash.users.validate.oldPasswordNotMatch'),
  })
  oldPassword;

  @IsNotEmpty({
    groups: ['registration', 'security', 'signIn'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @IsPasswordCorrect({
    groups: ['signIn'],
    message: () => i18next.t('flash.users.validate.wrongPassword'),
  })
  password;

  @IsNotEmpty({
    groups: ['registration', 'security'],
    message: () => i18next.t('flash.users.validate.notEmpty'),
  })
  @IsMatch('password', {
    groups: ['registration', 'security'],
    message: () => i18next.t('flash.users.validate.passwordNotMatch'),
  })
  repeatedPassword;

  @Column({ type: 'varchar' })
  @IsNotEmpty({
    groups: ['registration', 'security', 'signIn'],
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

  getFullName() {
    return `${this.lastName} ${this.lastName}`;
  }
}

export default User;
