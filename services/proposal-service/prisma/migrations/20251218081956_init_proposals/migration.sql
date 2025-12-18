-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "freelancer_id" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "bidAmount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);
