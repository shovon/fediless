-- CreateTable
CREATE TABLE "Followers" (
    "id" SERIAL NOT NULL,
    "actorId" TEXT NOT NULL,
    "acceptId" TEXT NOT NULL,

    CONSTRAINT "Followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Followers_actorId_key" ON "Followers"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Followers_acceptId_key" ON "Followers"("acceptId");
