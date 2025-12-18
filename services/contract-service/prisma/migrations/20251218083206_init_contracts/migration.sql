-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "freelancer_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);
