import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const board = prisma.board.createMany({
    data: [
      {
        ip: '192.168.10.53',
        place: 1,
        isBusy: false,
      },
      {
        ip: '192.168.10.54',
        place: 2,
        isBusy: false,
      },
      {
        ip: '192.168.10.55',
        place: 3,
        isBusy: false,
      },
      {
        ip: '192.168.10.56',
        place: 4,
        isBusy: false,
      },
    ],
  });

  const games = prisma.game.createMany({
    data: [
      {
        title: 'Game 1',
        url: 'http://localhost:3000/game/1',
      },
      {
        title: 'Game 2',
        url: 'http://localhost:3000/game/2',
      },
      {
        title: 'Game 3',
        url: 'http://localhost:3000/game/3',
      },
      {
        title: 'Game 4',
        url: 'http://localhost',
        port: 5100,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.$transaction([board, games]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
