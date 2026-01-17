-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "developer";

-- CreateTable
CREATE TABLE "developer"."developer_apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT,
    "redirectUris" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer"."webhook_subscriptions" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_apps_clientId_key" ON "developer"."developer_apps"("clientId");

-- AddForeignKey
ALTER TABLE "developer"."webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_appId_fkey" FOREIGN KEY ("appId") REFERENCES "developer"."developer_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
