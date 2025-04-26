/*
  Warnings:

  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Course` table. All the data in the column will be lost.
  - Added the required column `code` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lecturer` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "lecturer" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "room" TEXT,
DROP COLUMN "schedule",
ADD COLUMN     "schedule" JSONB NOT NULL;
