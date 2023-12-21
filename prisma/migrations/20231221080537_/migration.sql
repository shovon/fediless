/*
  Warnings:

  - Added the required column `followId` to the `Followers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Followers" ADD COLUMN     "followId" TEXT NOT NULL;
