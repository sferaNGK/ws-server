import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class GameSessionService {
	constructor(private readonly prismaService: PrismaService) {}

	getGameSessions() {
		return this.prismaService.gameSession.findMany();
	}
}
