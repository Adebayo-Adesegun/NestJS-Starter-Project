import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * BaseEntity - Base class for all entities
 * 
 * Date Handling:
 * - All timestamps are stored in UTC
 * - TypeORM automatically handles conversion from/to UTC
 * - Application logic should always work with UTC dates
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    comment: 'Record creation timestamp (UTC)',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    comment: 'Record last update timestamp (UTC)',
  })
  updatedAt?: Date;
}
