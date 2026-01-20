-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sync";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateTable
CREATE TABLE "users"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "linkedinId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "coverImageUrl" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "country" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "roles" TEXT[] DEFAULT ARRAY['FREELANCER']::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "banReason" TEXT,
    "banExpiresAt" TIMESTAMP(3),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "overview" TEXT,
    "hourlyRate" DECIMAL(65,30),
    "skills" TEXT[],
    "primaryCategoryId" TEXT,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "companyName" TEXT,
    "companyLogo" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "isPaymentVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "idDocument" TEXT,
    "isIdentityVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpiresAt" TIMESTAMP(3),
    "facebookId" TEXT,
    "githubId" TEXT,
    "keycloakId" TEXT,
    "languages" JSONB,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "taxId" TEXT,
    "billingAddress" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "jobSuccessScore" INTEGER NOT NULL DEFAULT 100,
    "trustScore" INTEGER NOT NULL DEFAULT 100,
    "badges" TEXT[],
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "promotionExpiresAt" TIMESTAMP(3),
    "isCloudMember" BOOLEAN NOT NULL DEFAULT false,
    "hasCloudOwnership" BOOLEAN NOT NULL DEFAULT false,
    "referralCode" TEXT,
    "taxIdType" TEXT,
    "taxVerifiedStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "taxFormType" TEXT,
    "taxSignatureName" TEXT,
    "taxSignatureDate" TIMESTAMP(3),
    "taxSignatureIp" TEXT,
    "kycMethod" TEXT,
    "documentData" JSONB,
    "videoInterviewAt" TIMESTAMP(3),
    "videoInterviewLink" TEXT,
    "backgroundCheckStatus" TEXT NOT NULL DEFAULT 'UNSTARTED',
    "backgroundCheckId" TEXT,
    "backgroundCheckUrl" TEXT,
    "backgroundCheckVerifiedAt" TIMESTAMP(3),
    "githubUsername" TEXT,
    "behanceUsername" TEXT,
    "dribbbleUsername" TEXT,
    "portfolioSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastPortfolioSync" TIMESTAMP(3),
    "communicationStyle" TEXT,
    "avgResponseTime" DOUBLE PRECISION,
    "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "metadata" JSONB,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'BASIC',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionEndsAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(65,30),
    "client_id" TEXT NOT NULL,
    "teamId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FIXED_PRICE',
    "experienceLevel" TEXT NOT NULL DEFAULT 'ENTRY',
    "locationType" TEXT NOT NULL DEFAULT 'REMOTE',
    "location" TEXT,
    "attachments" TEXT[],
    "duration" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "promotionExpiresAt" TIMESTAMP(3),
    "closeReason" TEXT,
    "preferredCommunicationStyle" TEXT,
    "screeningQuestions" JSONB,
    "talentCloudId" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Proposal" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "specializedProfileId" TEXT,
    "agencyId" TEXT,
    "coverLetter" TEXT NOT NULL,
    "bidAmount" DECIMAL(65,30),
    "timeline" TEXT,
    "attachments" TEXT[],
    "portfolioItemIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "aiScore" INTEGER,
    "aiAnalysis" TEXT,
    "screeningAnswers" JSONB,
    "extensionRequestDate" TIMESTAMP(3),
    "extensionRequestReason" TEXT,
    "extensionRequestStatus" TEXT,
    "autoReleaseDays" INTEGER NOT NULL DEFAULT 14,
    "boostAmount" INTEGER NOT NULL DEFAULT 0,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Milestone" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "autoReleaseDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Timesheet" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalHours" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."TimeEntry" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Submission" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."JobInvitation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."ServicePackage" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "bronzePrice" DECIMAL(65,30) NOT NULL,
    "bronzeDeliveryTime" INTEGER NOT NULL,
    "bronzeDeliverables" TEXT[],
    "silverPrice" DECIMAL(65,30),
    "silverDeliveryTime" INTEGER,
    "silverDeliverables" TEXT[],
    "goldPrice" DECIMAL(65,30),
    "goldDeliveryTime" INTEGER,
    "goldDeliverables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."JobSkill" (
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "jobs"."SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."JobAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyword" TEXT,
    "categoryId" TEXT,
    "minBudget" DECIMAL(65,30),
    "maxBudget" DECIMAL(65,30),
    "experienceLevel" TEXT,
    "locationType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."Interview" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "meetingUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "users_email_key" ON "users"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"."users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_linkedinId_key" ON "users"."users"("linkedinId");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"."users"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"."users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloakId_key" ON "users"."users"("keycloakId");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"."users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_proposalId_startDate_key" ON "jobs"."Timesheet"("proposalId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "jobs"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "jobs"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "jobs"."Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "jobs"."SavedJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "sync_tombstones_entity_deletedAt_userId_idx" ON "sync"."sync_tombstones"("entity", "deletedAt", "userId");

-- AddForeignKey
ALTER TABLE "jobs"."Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "jobs"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."Proposal" ADD CONSTRAINT "Proposal_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."Milestone" ADD CONSTRAINT "Milestone_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "jobs"."Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."Timesheet" ADD CONSTRAINT "Timesheet_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "jobs"."Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."TimeEntry" ADD CONSTRAINT "TimeEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "jobs"."Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."Submission" ADD CONSTRAINT "Submission_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "jobs"."Milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."JobInvitation" ADD CONSTRAINT "JobInvitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."ServicePackage" ADD CONSTRAINT "ServicePackage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "jobs"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "jobs"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "jobs"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."Interview" ADD CONSTRAINT "Interview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
