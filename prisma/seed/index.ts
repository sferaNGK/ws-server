import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const board = prisma.board.createMany({
		data: [
			{
				ip: '192.168.1.25',
				place: 1,
				isBusy: false,
			},
			{
				ip: '192.168.1.158',
				place: 2,
				isBusy: false,
			},
			{
				ip: '192.168.1.245',
				place: 3,
				isBusy: false,
			},
			{
				ip: '192.168.1.15',
				place: 4,
				isBusy: false,
			},
			// {
			// 	ip: '192.168.10.149',
			// 	place: 4,
			// 	isBusy: false,
			// },
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
				title: 'Сортер комплектующие',
				url: 'http://192.168.1.108:1888/game/1',
			},
			{
				title: 'Сортер программист',
				url: 'http://192.168.1.108:1888/game/2',
			},
			{
				title: 'Сортер распорядок',
				url: 'http://192.168.1.108:1888/game/3',
			},
			// {
			// 	title: 'Сортер качества воспитателя',
			// 	url: 'http://192.168.1.108:1888/game/4',
			// },
			// {
			// 	title: 'Ситуации | детская психология',
			// 	url: 'http://192.168.1.108:1777/game/1',
			// },
			// {
			// 	title: 'Ситуации | педагогические ситуации',
			// 	url: 'http://192.168.1.108:1777/game/2',
			// },
			// {
			// 	title: 'Ситуации | языки программирования',
			// 	url: 'http://192.168.1.108:1777/game/3',
			// },
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
