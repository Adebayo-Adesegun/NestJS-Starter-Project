import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * PasswordResetToken entity for secure password reset flow.
 * Uses hashed tokens with expiry to allow revocation and prevent token reuse.
 * OWASP A07:2021 - Broken Access Control mitigation.
 */
@Entity({ name: 'password_reset_token' })
@Index(['userId', 'expiresAt'])
@Index(['tokenHash'])
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'SHA256 hash of the reset token',
  })
  tokenHash: string;

  @Column({ type: 'timestamp', comment: 'When this token expires' })
  expiresAt: Date;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this token has been used',
  })
  used: boolean;

  @Column({ type: 'timestamp', nullable: true, comment: 'When token was used' })
  usedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
