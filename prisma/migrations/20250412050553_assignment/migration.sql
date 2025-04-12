/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `BoardMember` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BoardMember` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `KanbanColumn` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `KanbanColumn` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `KanbanTask` table. All the data in the column will be lost.
  - You are about to alter the column `budget` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - A unique constraint covering the columns `[boardId,order]` on the table `KanbanColumn` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Made the column `priority` on table `KanbanTask` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clientName` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `budget` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assignedTo` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "KanbanTask" DROP CONSTRAINT "KanbanTask_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_kanbanBoardId_fkey";

-- DropIndex
DROP INDEX "Project_kanbanBoardId_key";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "kanbanBoardId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'not-started';

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BoardMember" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "KanbanColumn" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "KanbanTask" DROP COLUMN "assignedToId",
ADD COLUMN     "labels" TEXT[],
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "priority" SET DEFAULT 'medium';

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "clientName" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "budget" SET NOT NULL,
ALTER COLUMN "budget" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "assignedTo" SET NOT NULL;

-- CreateTable
CREATE TABLE "TaskAssignee" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignee_taskId_userId_key" ON "TaskAssignee"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanColumn_boardId_order_key" ON "KanbanColumn"("boardId", "order");

-- AddForeignKey
ALTER TABLE "KanbanTask" ADD CONSTRAINT "KanbanTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_kanbanBoardId_fkey" FOREIGN KEY ("kanbanBoardId") REFERENCES "KanbanBoard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "KanbanTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
