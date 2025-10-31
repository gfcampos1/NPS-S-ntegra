-- AlterTable
ALTER TABLE "users" ADD COLUMN "tempPassword" TEXT;
ALTER TABLE "users" ADD COLUMN "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false;
