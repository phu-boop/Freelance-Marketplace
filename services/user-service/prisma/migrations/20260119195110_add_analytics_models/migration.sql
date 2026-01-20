-- CreateTable
CREATE TABLE "users"."AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."FreelancerMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "earnings" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "projectsCompleted" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."ClientMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSpend" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "projectsPosted" INTEGER NOT NULL DEFAULT 0,
    "activeContracts" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerMetric_userId_key" ON "users"."FreelancerMetric"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMetric_userId_key" ON "users"."ClientMetric"("userId");

-- AddForeignKey
ALTER TABLE "users"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."FreelancerMetric" ADD CONSTRAINT "FreelancerMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."ClientMetric" ADD CONSTRAINT "ClientMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
