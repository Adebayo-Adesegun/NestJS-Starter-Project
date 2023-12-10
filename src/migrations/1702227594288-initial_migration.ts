import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1702227594288 implements MigrationInterface {
  name = 'InitialMigration1702227594288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "othername" character varying(50), "username" character varying(50), "phone_number" character varying(50) NOT NULL, "profile_picture" character varying, "date_of_birth" date, "is_phone_number_verified" boolean NOT NULL DEFAULT false, "phone_number_verified_at" TIMESTAMP, "email" character varying(255) NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP, "password" character varying(255) NOT NULL, "accept_tos" boolean NOT NULL DEFAULT false, "last_login" TIMESTAMP, "is_admin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_01eea41349b6c9275aec646eee0" UNIQUE ("phone_number"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "email-idx" ON "user" ("email") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_e211e4e3c0aa76047889fccbb1" ON "user" ("first_name", "last_name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e211e4e3c0aa76047889fccbb1"`,
    );
    await queryRunner.query(`DROP INDEX "public"."email-idx"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
