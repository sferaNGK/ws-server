/*
  Warnings:

  - You are about to drop the column `clientId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `teamName` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "clientId",
DROP COLUMN "teamName",
ADD COLUMN     "client_id" TEXT NOT NULL,
ADD COLUMN     "team_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_team_name_key" ON "users"("team_name");
