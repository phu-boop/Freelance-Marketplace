-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'FIXED_PRICE';
