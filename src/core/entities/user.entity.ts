import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'user' })
@Index(['firstName', 'lastName'])
export class User extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  othername: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  username: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, unique: true })
  phoneNumber: string;

  @Column({ name: 'profile_picture', type: 'varchar', nullable: true })
  profilePicture: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'boolean', name: 'is_phone_number_verified', default: false })
  isPhoneNumberVerified: boolean;

  @Column({
    type: 'timestamp',
    name: 'phone_number_verified_at',
    nullable: true,
  })
  phoneNumberVerifiedAt: Date;

  @Index('email-idx')
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'boolean', name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'timestamp',
    name: 'email_verified_at',
    nullable: true,
  })
  emailVerifiedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({
    type: 'boolean',
    name: 'accept_tos',
    default: false,
  })
  acceptTos: boolean;

  @Column({ type: 'timestamp', name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ type: 'boolean', name: 'is_admin', default: false })
  isAdmin: boolean;

  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }
}
