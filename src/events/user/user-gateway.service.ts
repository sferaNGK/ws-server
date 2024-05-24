import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { AppLogger } from '@/app-logger/app-logger';
import { RegisterTeamHandler, VerifyCodeHandler } from '@/types';
import { Prisma, User, Board, GameSession } from '@prisma/client';

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
  }: RegisterTeamHandler): Promise<{ user: User; board: Board }> {
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
        gameSessionId: currentSession.id,
      },
    });

    const updatedBoard = await this.prismaService.board.update({
      where: { id: board.id },
      data: {
        isBusy: true,
      },
    });

    return { user, board: updatedBoard };
  }

  async onVerifyCode({
    code,
    ip,
    client,
  }: VerifyCodeHandler): Promise<boolean | void> {
    const gameSession = await this.redisService.get('currentGameSession');

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
    });

    const board = await this.prismaService.board.findUnique({
      where: { ip },
    });

    this.logger.debug(user, board, UserGatewayService.name);

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

    const updatedUser = await this.prismaService.user.update({
      where: { code },
      data: {
        boardId: board.id,
        clientId: client.id,
        isVerified: true,
        code: null,
      },
    });

    return updatedUser.isVerified;
  }
}
