/*
  Warnings:

  - Added the required column `updatedAt` to the `Milestone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contracts"."Contract" ADD COLUMN     "agencyId" TEXT,
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "autoReleaseDays" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "costCenter" TEXT,
ADD COLUMN     "customClauses" JSONB,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "eorFeePercentage" DECIMAL(65,30) NOT NULL DEFAULT 5.0,
ADD COLUMN     "escrowAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "escrowStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "insurancePolicyId" TEXT,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "templateUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'FREELANCE';

-- AlterTable
ALTER TABLE "contracts"."Milestone" ADD COLUMN     "autoReleaseDate" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "escrowStatus" TEXT NOT NULL DEFAULT 'UNFUNDED',
ADD COLUMN     "progressPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "contracts"."Submission" ADD COLUMN     "revisionCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "contracts"."ContractApprovalRequest" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "reason" TEXT,
    "requiredRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approvals" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."InsurancePolicy" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "coverageAmount" DECIMAL(65,30) NOT NULL,
    "premiumAmount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."Workspace" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."CheckIn" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "meetingLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."Dispute" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "disputeTimeoutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."TimeLog" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "hours" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."ArbitrationCase" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "investigatorId" TEXT,
    "decision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArbitrationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."RevisionRequest" (
    "id" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."TimeSession" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "description" TEXT,
    "activityScore" DOUBLE PRECISION,
    "idleMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts"."ContractTemplate" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractApprovalRequest_contractId_key" ON "contracts"."ContractApprovalRequest"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePolicy_contractId_key" ON "contracts"."InsurancePolicy"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_contractId_key" ON "contracts"."Workspace"("contractId");

-- AddForeignKey
ALTER TABLE "contracts"."Contract" ADD CONSTRAINT "Contract_insurancePolicyId_fkey" FOREIGN KEY ("insurancePolicyId") REFERENCES "contracts"."InsurancePolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."ContractApprovalRequest" ADD CONSTRAINT "ContractApprovalRequest_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."Workspace" ADD CONSTRAINT "Workspace_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."CheckIn" ADD CONSTRAINT "CheckIn_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."Dispute" ADD CONSTRAINT "Dispute_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."TimeLog" ADD CONSTRAINT "TimeLog_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."ArbitrationCase" ADD CONSTRAINT "ArbitrationCase_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."RevisionRequest" ADD CONSTRAINT "RevisionRequest_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "contracts"."Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."TimeSession" ADD CONSTRAINT "TimeSession_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
