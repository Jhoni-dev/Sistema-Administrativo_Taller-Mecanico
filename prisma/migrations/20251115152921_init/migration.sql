/*
  Warnings:

  - Added the required column `brand` to the `Pieces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pieces" ADD COLUMN     "brand" VARCHAR(50) NOT NULL;
