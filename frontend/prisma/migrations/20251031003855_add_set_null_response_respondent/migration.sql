-- AlterTable: Add SET NULL to responses -> respondents relationship
-- This allows deleting a respondent without losing the responses (they become anonymous)

-- Drop existing foreign key constraint
ALTER TABLE "responses" DROP CONSTRAINT "responses_respondentId_fkey";

-- Add new foreign key constraint with SET NULL
ALTER TABLE "responses" ADD CONSTRAINT "responses_respondentId_fkey"
  FOREIGN KEY ("respondentId") REFERENCES "respondents"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
