/*
  Warnings:

  - You are about to drop the column `brand` on the `Pieces` table. All the data in the column will be lost.
  - Added the required column `brand_piece` to the `Pieces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pieces" DROP COLUMN "brand",
ADD COLUMN     "brand_piece" VARCHAR(50) NOT NULL;
