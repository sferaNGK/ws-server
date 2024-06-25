import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TeamNameCheckDto } from '@/user/dto';
import { UserCheckResponse } from '@/user/interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GameSession } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(
		private readonly prismaService: PrismaService,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {}

	async checkTeamName({
		teamName,
	}: TeamNameCheckDto): Promise<UserCheckResponse> {
		const user = await this.prismaService.user.findFirst({
			where: { teamName },
		});

		if (!user) throw new NotFoundException('Команда не найдена.');

		return { success: true };
	}

	async getUsersInCurrentSession() {
		const currentSession =
			await this.cacheManager.get<GameSession>('currentGameSession');

		if (!currentSession) throw new NotFoundException('Сессия не найдена.');

		const users = await this.prismaService.user.findMany({
			where: {
				gameSessionId: currentSession.id,
			},
			select: {
				teamName: true,
				points: true,
			},
		});

		if (users.length === 0)
			throw new NotFoundException('Пользователи не найдены.');

		await this.cacheManager.del('currentGameSession');

		return users;
	}
}
