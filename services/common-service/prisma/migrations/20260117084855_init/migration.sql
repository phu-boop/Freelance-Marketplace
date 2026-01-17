-- CreateTable
CREATE TABLE "common"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "common"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "common"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "common"."skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "common"."skills"("slug");
