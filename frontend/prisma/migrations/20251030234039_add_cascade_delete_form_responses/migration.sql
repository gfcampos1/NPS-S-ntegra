-- AlterTable: Add CASCADE DELETE to responses -> forms relationship
-- This allows deleting a form to automatically delete all its responses

-- Drop existing foreign key constraint
ALTER TABLE "responses" DROP CONSTRAINT "responses_formId_fkey";

-- Add new foreign key constraint with CASCADE DELETE
ALTER TABLE "responses" ADD CONSTRAINT "responses_formId_fkey"
  FOREIGN KEY ("formId") REFERENCES "forms"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
