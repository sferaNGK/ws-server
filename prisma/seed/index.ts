import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const board = prisma.board.createMany({
		data: [
			{
				ip: '192.168.10.146',
				place: 1,
				isBusy: false,
			},
			{
				ip: '192.168.10.124',
				place: 2,
				isBusy: false,
			},
			{
				ip: '192.168.10.150',
				place: 3,
				isBusy: false,
			},
			{
				ip: '192.168.10.149',
				place: 4,
				isBusy: false,
			},
			// {
			// 	ip: '192.168.1.126',
			// 	place: 4,
			// 	isBusy: false,
			// },
		],
	});

	const games = prisma.game.createMany({
		data: [
			{
				title: 'Game 1',
				url: 'http://192.168.10.124:5173/game/1',
			},
			{
				title: 'Game 2',
				url: 'http://192.168.10.124:5173/game/2',
			},
			{
				title: 'Game 3',
				url: 'http://192.168.10.124:5173/game/3',
			},
			{
				title: 'Game 4',
				url: 'http://192.168.10.124:5173/game/4',
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
