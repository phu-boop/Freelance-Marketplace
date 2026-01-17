-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "community";

-- CreateTable
CREATE TABLE "community"."forum_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community"."forum_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT[],
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community"."forum_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community"."forum_votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "value" INTEGER NOT NULL,

    CONSTRAINT "forum_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_categories_name_key" ON "community"."forum_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "forum_categories_slug_key" ON "community"."forum_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "forum_votes_userId_postId_key" ON "community"."forum_votes"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "forum_votes_userId_commentId_key" ON "community"."forum_votes"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "community"."forum_posts" ADD CONSTRAINT "forum_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "community"."forum_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community"."forum_comments" ADD CONSTRAINT "forum_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community"."forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community"."forum_comments" ADD CONSTRAINT "forum_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "community"."forum_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community"."forum_votes" ADD CONSTRAINT "forum_votes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community"."forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community"."forum_votes" ADD CONSTRAINT "forum_votes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "community"."forum_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
