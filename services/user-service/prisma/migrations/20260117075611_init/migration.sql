/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebookId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[keycloakId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PortfolioItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sync";

-- AlterTable
ALTER TABLE "users"."Education" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users"."Experience" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users"."PortfolioItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users"."users" ADD COLUMN     "avgResponseTime" DOUBLE PRECISION,
ADD COLUMN     "backgroundCheckId" TEXT,
ADD COLUMN     "backgroundCheckStatus" TEXT NOT NULL DEFAULT 'UNSTARTED',
ADD COLUMN     "backgroundCheckUrl" TEXT,
ADD COLUMN     "backgroundCheckVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "behanceUsername" TEXT,
ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "communicationStyle" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "documentData" JSONB,
ADD COLUMN     "dribbbleUsername" TEXT,
ADD COLUMN     "facebookId" TEXT,
ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "hasCloudOwnership" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCloudMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keycloakId" TEXT,
ADD COLUMN     "kycMethod" TEXT,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "lastPortfolioSync" TIMESTAMP(3),
ADD COLUMN     "linkedinUsername" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "portfolioSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN     "taxFormType" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "taxIdType" TEXT,
ADD COLUMN     "taxSignatureDate" TIMESTAMP(3),
ADD COLUMN     "taxSignatureIp" TEXT,
ADD COLUMN     "taxSignatureName" TEXT,
ADD COLUMN     "taxVerifiedStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "twitterUsername" TEXT,
ADD COLUMN     "videoInterviewAt" TIMESTAMP(3),
ADD COLUMN     "videoInterviewLink" TEXT;

-- CreateTable
CREATE TABLE "users"."EmployeeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "taxStatus" TEXT NOT NULL DEFAULT 'W2',
    "benefitsPackage" TEXT NOT NULL DEFAULT 'BASIC',
    "dependentsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."Certification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "verificationUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."ContractClause" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."SSOConfig" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SSOConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."ApprovalPolicy" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "minAmount" DECIMAL(65,30),
    "requiredRoles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."Department" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "budget" DECIMAL(65,30),
    "spent" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."SavedFreelancer" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "note" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedFreelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync"."sync_tombstones" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "userId" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_tombstones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "users"."EmployeeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SSOConfig_teamId_key" ON "users"."SSOConfig"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "SSOConfig_domain_key" ON "users"."SSOConfig"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalPolicy_teamId_triggerType_key" ON "users"."ApprovalPolicy"("teamId", "triggerType");

-- CreateIndex
CREATE UNIQUE INDEX "Department_teamId_name_key" ON "users"."Department"("teamId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SavedFreelancer_clientId_freelancerId_key" ON "users"."SavedFreelancer"("clientId", "freelancerId");

-- CreateIndex
CREATE INDEX "sync_tombstones_entity_deletedAt_userId_idx" ON "sync"."sync_tombstones"("entity", "deletedAt", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"."users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"."users"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"."users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloakId_key" ON "users"."users"("keycloakId");

-- AddForeignKey
ALTER TABLE "users"."EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Certification" ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."ContractClause" ADD CONSTRAINT "ContractClause_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "users"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."SSOConfig" ADD CONSTRAINT "SSOConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "users"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."ApprovalPolicy" ADD CONSTRAINT "ApprovalPolicy_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "users"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Department" ADD CONSTRAINT "Department_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "users"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."SavedFreelancer" ADD CONSTRAINT "SavedFreelancer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."SavedFreelancer" ADD CONSTRAINT "SavedFreelancer_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
