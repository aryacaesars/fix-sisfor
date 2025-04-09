/*
  Warnings:

  - A unique constraint covering the columns `[kanbanBoardId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "kanbanBoardId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_kanbanBoardId_key" ON "Project"("kanbanBoardId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_kanbanBoardId_fkey" FOREIGN KEY ("kanbanBoardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
