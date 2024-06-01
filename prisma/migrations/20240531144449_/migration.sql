/*
  Warnings:

  - You are about to drop the column `client_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_id_phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id_board]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `specialty_id` to the `games` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_client_id_key";

-- AlterTable
ALTER TABLE "game_assignments" ALTER COLUMN "board_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "is_started" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "specialty_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "client_id",
ADD COLUMN     "board_id" INTEGER,
ADD COLUMN     "client_id_board" TEXT,
ADD COLUMN     "client_id_phone" TEXT,
ALTER COLUMN "code" SET NOT NULL;

-- CreateTable
CREATE TABLE "Specialty" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_client_id_phone_key" ON "users"("client_id_phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_client_id_board_key" ON "users"("client_id_board");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
