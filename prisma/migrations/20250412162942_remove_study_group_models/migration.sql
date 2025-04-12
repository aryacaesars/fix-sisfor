/*
  Warnings:

  - You are about to drop the `StudyGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudyGroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudyGroupSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudyGroup" DROP CONSTRAINT "StudyGroup_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupMember" DROP CONSTRAINT "StudyGroupMember_studyGroupId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupMember" DROP CONSTRAINT "StudyGroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupSession" DROP CONSTRAINT "StudyGroupSession_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupSession" DROP CONSTRAINT "StudyGroupSession_studyGroupId_fkey";

-- DropTable
DROP TABLE "StudyGroup";

-- DropTable
DROP TABLE "StudyGroupMember";

-- DropTable
DROP TABLE "StudyGroupSession";
