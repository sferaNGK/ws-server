import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { AppLogger } from '@/app-logger/app-logger';
import { RegisterTeamData, VerifyCodeData } from '@/types';
import { Prisma, User, Board, GameSession, Game } from '@prisma/client';

@Injectable()
export class UserGatewayService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly logger: AppLogger,
		private readonly redisService: RedisService,
	) {}

	async onRegisterTeam({
		teamName,
		code,
		client,
	}: RegisterTeamData): Promise<{ user: User; board: Board }> {
		const currentSession: GameSession = JSON.parse(
			await this.redisService.get('currentGameSession'),
		);

		if (!currentSession) {
			throw new Prisma.PrismaClientKnownRequestError(
				'Игровая сессия не найдена. Попросите администратора создать сессию.',
				{
					code: 'P2025',
					meta: {
						modelName: 'GameSession',
					},
					clientVersion: '5.14.0',
				},
			);
		}

		const existedUser = await this.prismaService.user.findFirst({
			where: { teamName, gameSessionId: currentSession.id },
		});

		if (existedUser) {
			throw new Prisma.PrismaClientKnownRequestError(
				'Команда с таким названием уже зарегистрирована.',
				{
					code: 'P2002',
					meta: {
						modelName: 'User',
					},
					clientVersion: '5.14.0',
				},
			);
		}

		const board = await this.prismaService.board.findFirst({
			where: { isBusy: false },
		});

		if (!board) {
			throw new Prisma.PrismaClientKnownRequestError('Нет свободных досок.', {
				code: 'C1025',
				meta: {
					modelName: 'Board',
				},
				clientVersion: '5.14.0',
			});
		}

		const user = await this.prismaService.user.create({
			data: {
				teamName,
				role: 'PLAYER',
				code,
				clientIdPhone: client.id,
				gameSessionId: currentSession.id,
			},
		});

		const updatedBoard = await this.prismaService.board.update({
			where: { id: board.id },
			data: {
				isBusy: true,
			},
		});

		await this.prismaService.user.update({
			where: { id: user.id },
			data: {
				boardId: board.id,
			},
		});

		return { user, board: updatedBoard };
	}

	async onVerifyCode({
		code,
		ip,
		client,
	}: VerifyCodeData): Promise<
		boolean | { game: Game; isSessionStarted: boolean }
	> {
		// TODO: если у пользователя есть игра, то нужно ему кинуть ее и смотреть на одну свободную доску! (? kak)

		const gameSession: GameSession = JSON.parse(
			await this.redisService.get('currentGameSession'),
		);

		if (!gameSession) {
			throw new Prisma.PrismaClientKnownRequestError(
				'Игровая сессия не найдена. Попросите администратора создать сессию.',
				{
					code: 'P2025',
					meta: {
						modelName: 'GameSession',
					},
					clientVersion: '5.14.0',
				},
			);
		}

		const user = await this.prismaService.user.findFirst({
			where: { code },
			include: { board: true },
		});

		const board = await this.prismaService.board.findUnique({
			where: { ip },
		});

		if (!user)
			throw new Prisma.PrismaClientKnownRequestError('Неверный код.', {
				code: 'P2025',
				meta: {
					modelName: 'Code',
				},
				clientVersion: '5.14.0',
			});

		if (!board)
			throw new Prisma.PrismaClientKnownRequestError('Доска не найдена.', {
				code: 'P2025',
				meta: {
					modelName: 'Board',
				},
				clientVersion: '5.14.0',
			});

		if (user.boardId !== board.id) {
			throw new Prisma.PrismaClientKnownRequestError(
				'Вы подошли не к той доске.',
				{
					code: 'C1001',
					meta: {
						modelName: 'Board',
					},
					clientVersion: '5.14.0',
				},
			);
		}

		const updatedUser = await this.prismaService.user.update({
			where: { code },
			data: {
				boardId: board.id,
				clientIdBoard: client.id,
				isVerified: true,
			},
		});

		const prismaGameSession = await this.prismaService.gameSession.findUnique({
			where: {
				id: gameSession.id,
			},
		});

		if (prismaGameSession.isStarted) {
			const nextGameAssignment =
				await this.prismaService.gameAssignment.findFirst({
					where: {
						userId: updatedUser.id,
						gameSessionId: gameSession.id,
						isCompleted: false,
					},
				});

			const updatedGameAssignment =
				await this.prismaService.gameAssignment.update({
					where: {
						id: nextGameAssignment.id,
					},
					data: {
						boardId: board.id,
					},
					include: {
						game: true,
					},
				});

			this.logger.log(
				updatedGameAssignment,
				client.handshake.query.clientIdBoard,
				UserGatewayService.name,
			);

			return {
				game: updatedGameAssignment.game,
				isSessionStarted: prismaGameSession.isStarted,
			};
		} else {
			return updatedUser.isVerified;
		}
	}
}
