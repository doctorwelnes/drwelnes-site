-- CreateTable
CREATE TABLE "FavoriteRecipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteRecipe_userId_createdAt_idx" ON "FavoriteRecipe"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteRecipe_userId_recipeId_key" ON "FavoriteRecipe"("userId", "recipeId");

-- CreateIndex
CREATE INDEX "FavoriteExercise_userId_createdAt_idx" ON "FavoriteExercise"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteExercise_userId_exerciseId_key" ON "FavoriteExercise"("userId", "exerciseId");

-- AddForeignKey
ALTER TABLE "FavoriteRecipe" ADD CONSTRAINT "FavoriteRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteExercise" ADD CONSTRAINT "FavoriteExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
