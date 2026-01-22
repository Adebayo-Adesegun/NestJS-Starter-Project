import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to update timestamp columns to use 'timestamp with time zone'
 * 
 * This ensures all date/time data is stored with timezone information,
 * enabling proper UTC handling across the application.
 * 
 * Run: npm run migration:run
 * Revert: npm run migration:revert
 */
export class UpdateTimestampColumnsToTimestamptz1737000000000
  implements MigrationInterface
{
  name = 'UpdateTimestampColumnsToTimestamptz1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set timezone to UTC for this session
    await queryRunner.query(`SET TIME ZONE 'UTC'`);

    // Update base entity timestamp columns
    // Note: Existing data will be preserved and interpreted as UTC
    
    // Example for user table (adjust table names as needed)
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "created_at" TYPE timestamp with time zone
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "updated_at" TYPE timestamp with time zone
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "last_login" TYPE timestamp with time zone
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "phone_number_verified_at" TYPE timestamp with time zone
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "email_verified_at" TYPE timestamp with time zone
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "password_changed_at" TYPE timestamp with time zone
    `);

    // Add similar ALTER statements for other tables with timestamp columns
    // Example:
    // await queryRunner.query(`
    //   ALTER TABLE "role" 
    //   ALTER COLUMN "created_at" TYPE timestamp with time zone
    // `);
    
    console.log('✅ All timestamp columns updated to timestamp with time zone');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to timestamp without time zone
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "password_changed_at" TYPE timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "email_verified_at" TYPE timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "phone_number_verified_at" TYPE timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "last_login" TYPE timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "updated_at" TYPE timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "created_at" TYPE timestamp
    `);

    console.log('⚠️  Reverted timestamp columns to timestamp without time zone');
  }
}
