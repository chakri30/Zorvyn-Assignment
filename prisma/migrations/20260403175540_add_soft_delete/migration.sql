-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Record_isDeleted_idx" ON "Record"("isDeleted");
