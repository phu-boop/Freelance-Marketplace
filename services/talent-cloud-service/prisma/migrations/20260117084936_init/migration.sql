-- CreateEnum
CREATE TYPE "talent_clouds"."Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "talent_clouds"."CloudRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "talent_clouds"."TalentCloud" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "visibility" "talent_clouds"."Visibility" NOT NULL DEFAULT 'PRIVATE',
    "costCenter" TEXT,
    "budget" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentCloud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_clouds"."TalentCloudMember" (
    "id" TEXT NOT NULL,
    "cloudId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "talent_clouds"."CloudRole" NOT NULL DEFAULT 'MEMBER',
    "metadata" JSONB,

    CONSTRAINT "TalentCloudMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentCloudMember_cloudId_userId_key" ON "talent_clouds"."TalentCloudMember"("cloudId", "userId");

-- AddForeignKey
ALTER TABLE "talent_clouds"."TalentCloudMember" ADD CONSTRAINT "TalentCloudMember_cloudId_fkey" FOREIGN KEY ("cloudId") REFERENCES "talent_clouds"."TalentCloud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
