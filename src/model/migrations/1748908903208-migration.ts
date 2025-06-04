import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1748908903208 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE tasks ADD COLUMN deletedAt TIMESTAMP NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
