import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@/prisma/prisma.service';
import { Game, GameSession, Prisma } from '@prisma/client';
import { RedisService } from '@/redis/redis.service';
import { CreateGameSessionData, GameEndData } from '@/types';
import { AppLogger } from '@/app-logger/app-logger';
import { UseFilters } from '@nestjs/common';
import { PrismaClientExceptionFilter } from '@/filters';
import { shuffle } from '@/utils';

@WebSocketGateway({
	cors: { origin: '*' },
})
@UseFilters(new PrismaClientExceptionFilter())
export class GameGateway {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly logger: AppLogger,
		private readonly redisService: RedisService,
	) {}

	@WebSocketServer()
	private server: Server;

	@SubscribeMessage('game:join')
	async onGameJoin(@ConnectedSocket() socket: Socket): Promise<void> {
		const currentSession = await this.redisService.get('currentGameSession');
		if (!currentSession) return;
		socket.join(JSON.parse(currentSession).title);
	}

	@SubscribeMessage('game:createGameSession')
	async onCreateGameSession(
		@MessageBody() data: CreateGameSessionData,
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const { isAdmin, title } = data;
		if (!isAdmin) return;
		const gameSession = await this.prismaService.gameSession.create({
			data: { title },
		});

		this.logger.log(
			`Game session created ${gameSession.title}`,
			GameGateway.name,
		);

		await this.redisService.setex(
			'currentGameSession',
			7200,
			JSON.stringify(gameSession),
		);

		const gameSessions = await this.prismaService.gameSession.findMany();

		client.emit('game:createGameSession', { isCreated: true, gameSessions });
	}

	@SubscribeMessage('game:start')
	async onStart(
		@MessageBody() data: { isAdmin: boolean; specialtyId: number },
	): Promise<void> {
		if (!data.isAdmin) return;
		const games = await this.prismaService.game.findMany({
			where: { specialtyId: data.specialtyId },
		});
		const currentSession: GameSession = JSON.parse(
			await this.redisService.get('currentGameSession'),
		);

		if (!currentSession)
			throw new Prisma.PrismaClientKnownRequestError(
				'На данный момент нет сессии.',
				{
					code: 'C1025',
					meta: {
						modelName: 'GameSession',
					},
					clientVersion: '5.14.0',
				},
			);

		const users = await this.server.in(currentSession.title).fetchSockets();

		for (const socket of users) {
			let user = await this.prismaService.user.findUnique({
				where: {
					clientIdBoard: socket.handshake.query.clientIdBoard as string,
				},
				include: {
					gameAssignment: {
						include: {
							game: true,
						},
					},
					board: true,
				},
			});

			const shuffledGames = shuffle<Game>(games);

			for await (const game of shuffledGames) {
				if (game.url === 'VR') {
					await this.prismaService.gameAssignment.create({
						data: {
							userId: user.id,
							gameId: game.id,
							gameSessionId: currentSession.id,
							boardId: 4,
						},
					});
				} else {
					await this.prismaService.gameAssignment.create({
						data: {
							userId: user.id,
							gameId: game.id,
							gameSessionId: currentSession.id,
							boardId: user.board.id,
						},
					});
				}
			}

			user = await this.prismaService.user.findUnique({
				where: {
					clientIdBoard: socket.handshake.query.clientIdBoard as string,
				},
				include: {
					gameAssignment: {
						include: {
							game: true,
						},
					},
					board: true,
				},
			});

			const gameSession = await this.prismaService.gameSession.findUnique({
				where: { id: currentSession.id },
			});

			const updatedGameSession = await this.prismaService.gameSession.update({
				where: { id: gameSession.id },
				data: { isStarted: true },
			});

			const game = user.gameAssignment.shift().game;
			this.logger.debug(game, GameGateway.name);

			//TODO: отправить игру на клиент в случае ВР

			// this.server.emit('game:start', {
			// 	isStarted: updatedGameSession.isStarted,
			// 	game,
			// 	clientIdPhone: socket.handshake.query.clientIdPhone as string,
			// });
			socket.emit('game:start', {
				isStarted: updatedGameSession.isStarted,
				game,
			});
		}
	}

	@SubscribeMessage('game:end')
	async onGameEnd(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: GameEndData,
	): Promise<void> {
		const { game, points } = data;

		if (!game || !points) return;

		const user = await this.prismaService.user.findUniqueOrThrow({
			where: { clientIdBoard: socket.handshake.query.clientIdBoard as string },
			include: {
				board: true,
			},
		});

		const prismaGame = await this.prismaService.game.findUniqueOrThrow({
			where: { id: game.id },
			include: {
				gameAssignment: {
					where: {
						gameId: game.id,
						userId: user.id,
						boardId: user.board.id,
					},
					include: {
						gameSession: true,
					},
				},
			},
		});

		const firstGameAssignment = prismaGame.gameAssignment.shift();
		const gameSessionId = firstGameAssignment.gameSessionId;

		const [_, updatedUserWithPoints] = await this.prismaService.$transaction([
			this.prismaService.gameAssignment.update({
				where: {
					id: firstGameAssignment.id,
				},
				data: {
					isCompleted: true,
				},
			}),

			this.prismaService.user.update({
				where: {
					id: user.id,
				},
				data: {
					points: user.points + points,
				},
				include: { board: true },
			}),
		]);

		const userAssignmentsCount = await this.prismaService.gameAssignment.count({
			where: {
				userId: updatedUserWithPoints.id,
				gameSessionId,
			},
		});

		const userAssignments = await this.prismaService.gameAssignment.findMany({
			where: {
				userId: user.id,
				gameSessionId,
				isCompleted: true,
			},
		});

		if (userAssignmentsCount === userAssignments.length) {
			this.logger.debug('Game is waiting', GameGateway.name);

			this.server.emit('game:waiting', {
				clientIdPhone: user.clientIdPhone,
				isWaiting: true,
			});
		}

		const [result, count] = await Promise.all([
			this.prismaService.gameAssignment.findMany({
				where: {
					gameSessionId,
					isCompleted: true,
				},
			}),
			this.prismaService.gameAssignment.count({
				where: {
					gameSessionId,
				},
			}),
		]);

		if (result.length === count) {
			await this.prismaService.$transaction(async () => {
				const endedGameSession = await this.prismaService.gameSession.update({
					where: { id: gameSessionId },
					data: { isStarted: false, isCompleted: true },
				});

				const users = await this.prismaService.user.findMany({
					where: {
						gameSessionId: endedGameSession.id,
					},
					select: {
						id: true,
						teamName: true,
						points: true,
					},
				});
				// TODO: под вопросом?
				// await this.redisService.del('currentGameSession');

				await this.prismaService.board.updateMany({
					where: { isBusy: true },
					data: { isBusy: false },
				});

				await this.prismaService.user.update({
					where: { id: user.id },
					data: { boardId: null },
				});

				this.server.emit('game:endGameSession', {
					isCompleted: endedGameSession.isCompleted,
					users,
				});
			});

			return;
		}

		const newBoard = await this.prismaService.board.findFirstOrThrow({
			where: { isBusy: false, AND: { place: { not: user.board.place } } },
		});

		await this.prismaService.$transaction(async () => {
			await this.prismaService.board.update({
				where: { id: user.board.id },
				data: { isBusy: false },
			});

			await this.prismaService.user.update({
				where: { id: user.id },
				data: { board: { connect: { id: newBoard.id } } },
				include: { board: true },
			});

			await this.prismaService.board.update({
				where: { id: newBoard.id },
				data: { isBusy: true },
			});
		});

		socket.emit('game:end', { isStarted: false });
		this.server.emit('game:newBoard', {
			clientIdPhone: user.clientIdPhone,
			board: newBoard,
		});
	}
}
