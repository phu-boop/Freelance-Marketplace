/*
  Warnings:

  - You are about to drop the column `availableConnects` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users"."Certification" ADD COLUMN     "specializedProfileId" TEXT;

-- AlterTable
ALTER TABLE "users"."Education" ADD COLUMN     "specializedProfileId" TEXT;

-- AlterTable
ALTER TABLE "users"."Experience" ADD COLUMN     "specializedProfileId" TEXT;

-- AlterTable
ALTER TABLE "users"."PortfolioItem" ADD COLUMN     "aiFeedback" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specializedProfileId" TEXT,
ADD COLUMN     "verificationScore" INTEGER;

-- AlterTable
ALTER TABLE "users"."Team" ADD COLUMN     "agencyWebsite" TEXT,
ADD COLUMN     "isAgency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "revenueSplitPercent" DECIMAL(65,30) NOT NULL DEFAULT 20.0,
ADD COLUMN     "taxId" TEXT;

-- AlterTable
ALTER TABLE "users"."users" DROP COLUMN "availableConnects",
ADD COLUMN     "addressEncrypted" TEXT,
ADD COLUMN     "billingAddressEncrypted" TEXT,
ADD COLUMN     "guardianFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "guardianRiskScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jobsHiredCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jobsPostedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxIdEncrypted" TEXT,
ADD COLUMN     "totalSpend" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "users"."Badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."IdentityVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "data" JSONB,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."TrustedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trustScore" INTEGER NOT NULL DEFAULT 100,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."SkillAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "questions" JSONB,
    "answers" JSONB,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."SpecializedProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "hourlyRate" DECIMAL(65,30),
    "skills" TEXT[],
    "primaryCategoryId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecializedProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."UserLoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."SecurityDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "lastIp" TEXT,
    "isTrusted" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_userId_name_key" ON "users"."Badge"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedDevice_userId_deviceId_key" ON "users"."TrustedDevice"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDevice_userId_deviceId_key" ON "users"."SecurityDevice"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "users"."Badge" ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."IdentityVerification" ADD CONSTRAINT "IdentityVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."TrustedDevice" ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Certification" ADD CONSTRAINT "Certification_specializedProfileId_fkey" FOREIGN KEY ("specializedProfileId") REFERENCES "users"."SpecializedProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."SkillAssessment" ADD CONSTRAINT "SkillAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Education" ADD CONSTRAINT "Education_specializedProfileId_fkey" FOREIGN KEY ("specializedProfileId") REFERENCES "users"."SpecializedProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Experience" ADD CONSTRAINT "Experience_specializedProfileId_fkey" FOREIGN KEY ("specializedProfileId") REFERENCES "users"."SpecializedProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."PortfolioItem" ADD CONSTRAINT "PortfolioItem_specializedProfileId_fkey" FOREIGN KEY ("specializedProfileId") REFERENCES "users"."SpecializedProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."SpecializedProfile" ADD CONSTRAINT "SpecializedProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."UserLoginHistory" ADD CONSTRAINT "UserLoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."SecurityDevice" ADD CONSTRAINT "SecurityDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
