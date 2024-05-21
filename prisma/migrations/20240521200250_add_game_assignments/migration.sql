-- CreateTable
CREATE TABLE "boards" (
    "id" SERIAL NOT NULL,
    "place" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "is_busy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_assignments" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "board_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_assignments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_assignments" ADD CONSTRAINT "game_assignments_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_assignments" ADD CONSTRAINT "game_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
