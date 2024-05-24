/*
  Warnings:

  - A unique constraint covering the columns `[ip]` on the table `boards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `game_session_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_team_name_key";

-- AlterTable
ALTER TABLE "game_assignments" ALTER COLUMN "game_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "game_session_id" INTEGER NOT NULL,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "boards_ip_key" ON "boards"("ip");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
