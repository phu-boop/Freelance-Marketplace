-- CreateEnum
CREATE TYPE "reviews"."ReviewStatus" AS ENUM ('PENDING', 'RELEASED');

-- CreateTable
CREATE TABLE "reviews"."reviews" (
    "id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewee_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "ratingOverall" INTEGER NOT NULL DEFAULT 0,
    "ratingCommunication" INTEGER NOT NULL DEFAULT 0,
    "ratingQuality" INTEGER NOT NULL DEFAULT 0,
    "ratingValue" INTEGER NOT NULL DEFAULT 0,
    "ratingSchedule" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "status" "reviews"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "revealedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
