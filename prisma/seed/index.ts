import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sphereIP = [
	'192.168.1.25',
	'192.168.1.158',
	'192.168.1.245',
	'192.168.1.15',
	'192.168.10.2',
];

const homeIP = ['192.168.1.124', '192.168.1.238'];

// const homeIP = ['192.168.1.108', '192.168.1.238'];

async function main() {
	if (process.env.NODE_ENV === 'dev-home') {
		await prisma.board.createMany({
			data: [
				{
					ip: homeIP[0],
					place: 1,
					isBusy: false,
				},
				{
					ip: homeIP[1],
					place: 2,
					isBusy: false,
				},
			],
		});
	} else if (process.env.NODE_ENV === 'dev') {
		await prisma.board.createMany({
			data: [
				{
					ip: sphereIP[0],
					place: 1,
					isBusy: false,
				},
				{
					ip: sphereIP[1],
					place: 2,
					isBusy: false,
				},
				{
					ip: sphereIP[2],
					place: 3,
					isBusy: false,
				},
				// {
				// 	ip: sphereIP[3],
				// 	place: 4,
				// 	isBusy: false,
				// },
				{
					ip: sphereIP[3],
					place: 5,
					isBusy: false,
				},
				// {
				// 	ip: sphereIP[4],
				// 	place: 6,
				// 	isBusy: false,
				// },
			],
		});
	}

	const specialities = prisma.specialty.createMany({
		data: [
			{
				title: 'Программисты',
			},
			{
				title: 'Дошкольное образование',
			},
		],
	});

	const games = prisma.game.createMany({
		data: [
			{
				title: 'Сортер комплектующие',
				url: 'http://192.168.1.108:8081/game/1',
				specialtyId: 1,
			},
			{
				title: 'Сортер программист',
				url: 'http://192.168.1.108:8081/game/2',
				specialtyId: 1,
			},
			{
				title: 'Сортер распорядок',
				url: 'http://192.168.1.108:8081/game/3',
				specialtyId: 2,
			},
			{
				title: 'Сортер качества воспитателя',
				url: 'http://192.168.1.108:8081/game/4',
				specialtyId: 2,
			},
			{
				title: 'Ситуации | детская психология',
				url: 'http://192.168.1.108:8080/game/1',
				specialtyId: 2,
			},
			{
				title: 'Ситуации | педагогические ситуации',
				url: 'http://192.168.1.108:8080/game/2',
				specialtyId: 2,
			},
			{
				title: 'Ситуации | языки программирования',
				url: 'http://192.168.1.108:8080/game/3',
				specialtyId: 1,
			},
			{
				title: 'Робот',
				url: 'http://192.168.1.108:1999',
				specialtyId: 1,
			},
			// {
			// 	title: 'VR | опасные предметы',
			// 	url: 'VR',
			// 	specialtyId: 2,
			// },
			// {
			// 	title: 'VR | история ЭВМ',
			// 	url: 'VR',
			// 	specialtyId: 1,
			// },
		],
		skipDuplicates: true,
	});

	await prisma.$transaction([specialities, games]);
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
