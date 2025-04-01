/*
  Warnings:

  - You are about to drop the column `content` on the `Template` table. All the data in the column will be lost.
  - Added the required column `link` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "content",
ADD COLUMN     "link" TEXT NOT NULL;
