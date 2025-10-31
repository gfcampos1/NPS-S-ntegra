-- AlterTable: Add CASCADE DELETE to answers -> questions relationship
-- This allows deleting a question to automatically delete all its answers

-- Drop existing foreign key constraint
ALTER TABLE "answers" DROP CONSTRAINT "answers_questionId_fkey";

-- Add new foreign key constraint with CASCADE DELETE
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey"
  FOREIGN KEY ("questionId") REFERENCES "questions"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
