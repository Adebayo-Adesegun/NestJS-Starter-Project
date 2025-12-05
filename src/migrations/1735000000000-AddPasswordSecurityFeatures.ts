import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class AddPasswordSecurityFeatures1735000000000
  implements MigrationInterface
{
  name = 'AddPasswordSecurityFeatures1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add passwordChangedAt column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'passwordChangedAt',
        type: 'timestamp',
        isNullable: true,
        default: null,
        comment:
          'Timestamp when password was last changed, used for session invalidation',
      }),
    );

    // Create password_reset_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            comment: 'Foreign key to users table',
          },
          {
            name: 'tokenHash',
            type: 'varchar',
            isUnique: true,
            comment: 'SHA256 hash of the reset token for secure storage',
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            comment: 'When the reset token expires',
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
            comment: 'Whether the token has been used to reset password',
          },
          {
            name: 'usedAt',
            type: 'timestamp',
            isNullable: true,
            comment: 'When the token was used',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['userId', 'expiresAt'],
            name: 'IDX_PASSWORD_RESET_TOKENS_USER_EXPIRY',
          },
          {
            columnNames: ['tokenHash'],
            name: 'IDX_PASSWORD_RESET_TOKENS_HASH',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop password_reset_tokens table
    await queryRunner.dropTable('password_reset_tokens', true);

    // Remove passwordChangedAt column from users table
    await queryRunner.dropColumn('users', 'passwordChangedAt');
  }
}
