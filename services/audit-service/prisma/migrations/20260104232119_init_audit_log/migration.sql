-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "service" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT,
    "amount" DECIMAL(18,2),
    "metadata" JSONB,
    "checksum" TEXT NOT NULL,
    "referenceId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
