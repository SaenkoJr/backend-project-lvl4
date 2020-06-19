import {MigrationInterface, QueryRunner} from "typeorm";

export class Tables1592570887927 implements MigrationInterface {
    name = 'Tables1592570887927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" PRIMARY KEY SERIAL, "name" varchar NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" PRIMARY KEY SERIAL, "name" varchar NOT NULL, "description" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "creatorId" integer, "assignedToId" integer, "statusId" integer)`);
        await queryRunner.query(`CREATE TABLE "task_statuses" ("id" PRIMARY KEY SERIAL, "name" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_324e55243a54dec785cedf743ba" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" PRIMARY KEY SERIAL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "email" varchar NOT NULL, "passwordDigest" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "tasks_tags" ("taskId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("taskId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_40bb3bd496ab08cf705cbd3c74" ON "tasks_tags" ("taskId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5a5bb5731ef8e634355be3a35" ON "tasks_tags" ("tagId") `);
        await queryRunner.query(`CREATE TABLE "temporary_tasks" ("id" PRIMARY KEY SERIAL, "name" varchar NOT NULL, "description" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "creatorId" integer, "assignedToId" integer, "statusId" integer, CONSTRAINT "FK_90bc62e96b48a437a78593f78f0" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d020677feafe94eba0cb9d846d1" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_a11f0de47a765c6c74ffbd10afa" FOREIGN KEY ("statusId") REFERENCES "task_statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_tasks"("id", "name", "description", "createdAt", "updatedAt", "creatorId", "assignedToId", "statusId") SELECT "id", "name", "description", "createdAt", "updatedAt", "creatorId", "assignedToId", "statusId" FROM "tasks"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`ALTER TABLE "temporary_tasks" RENAME TO "tasks"`);
        await queryRunner.query(`DROP INDEX "IDX_40bb3bd496ab08cf705cbd3c74"`);
        await queryRunner.query(`DROP INDEX "IDX_c5a5bb5731ef8e634355be3a35"`);
        await queryRunner.query(`CREATE TABLE "temporary_tasks_tags" ("taskId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "FK_40bb3bd496ab08cf705cbd3c74b" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_c5a5bb5731ef8e634355be3a35d" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("taskId", "tagId"))`);
        await queryRunner.query(`INSERT INTO "temporary_tasks_tags"("taskId", "tagId") SELECT "taskId", "tagId" FROM "tasks_tags"`);
        await queryRunner.query(`DROP TABLE "tasks_tags"`);
        await queryRunner.query(`ALTER TABLE "temporary_tasks_tags" RENAME TO "tasks_tags"`);
        await queryRunner.query(`CREATE INDEX "IDX_40bb3bd496ab08cf705cbd3c74" ON "tasks_tags" ("taskId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5a5bb5731ef8e634355be3a35" ON "tasks_tags" ("tagId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_c5a5bb5731ef8e634355be3a35"`);
        await queryRunner.query(`DROP INDEX "IDX_40bb3bd496ab08cf705cbd3c74"`);
        await queryRunner.query(`ALTER TABLE "tasks_tags" RENAME TO "temporary_tasks_tags"`);
        await queryRunner.query(`CREATE TABLE "tasks_tags" ("taskId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("taskId", "tagId"))`);
        await queryRunner.query(`INSERT INTO "tasks_tags"("taskId", "tagId") SELECT "taskId", "tagId" FROM "temporary_tasks_tags"`);
        await queryRunner.query(`DROP TABLE "temporary_tasks_tags"`);
        await queryRunner.query(`CREATE INDEX "IDX_c5a5bb5731ef8e634355be3a35" ON "tasks_tags" ("tagId") `);
        await queryRunner.query(`CREATE INDEX "IDX_40bb3bd496ab08cf705cbd3c74" ON "tasks_tags" ("taskId") `);
        await queryRunner.query(`ALTER TABLE "tasks" RENAME TO "temporary_tasks"`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" PRIMARY KEY SERIAL, "name" varchar NOT NULL, "description" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "creatorId" integer, "assignedToId" integer, "statusId" integer)`);
        await queryRunner.query(`INSERT INTO "tasks"("id", "name", "description", "createdAt", "updatedAt", "creatorId", "assignedToId", "statusId") SELECT "id", "name", "description", "createdAt", "updatedAt", "creatorId", "assignedToId", "statusId" FROM "temporary_tasks"`);
        await queryRunner.query(`DROP TABLE "temporary_tasks"`);
        await queryRunner.query(`DROP INDEX "IDX_c5a5bb5731ef8e634355be3a35"`);
        await queryRunner.query(`DROP INDEX "IDX_40bb3bd496ab08cf705cbd3c74"`);
        await queryRunner.query(`DROP TABLE "tasks_tags"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "task_statuses"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}
