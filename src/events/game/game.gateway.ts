import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@/prisma/prisma.service';
import { GameSession } from '@prisma/client';
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
  async onStart(@MessageBody() data: { isAdmin: boolean }): Promise<void> {
    if (!data.isAdmin) return;
    const games = await this.prismaService.game.findMany();
    const currentSession: GameSession = JSON.parse(
      await this.redisService.get('currentGameSession'),
    );
    const users = await this.server.in(currentSession.title).fetchSockets();

    for (const socket of users) {
      const user = await this.prismaService.user.findUnique({
        where: { clientId: socket.handshake.query.clientId as string },
        include: {
          gameAssignment: {
            include: {
              game: true,
            },
          },
          board: true,
        },
      });

      const shuffledGames = shuffle(games);

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

      if (
        user.gameAssignment &&
        Array.isArray(user.gameAssignment) &&
        user.gameAssignment.length > 0
      ) {
        socket.emit('game:start', {
          isStarted: true,
          game: user.gameAssignment.shift().game,
        });
      }
    }
  }

  @SubscribeMessage('game:end')
  async onGameEnd(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: GameEndData,
  ) {
    const { game } = data;
    const user = await this.prismaService.user.findUnique({
      where: { clientId: socket.handshake.query.clientId as string },
      include: {
        board: true,
      },
    });

    const prismaGame = await this.prismaService.game.findUniqueOrThrow({
      where: { id: game.id },
      include: {
        gameAssignment: {
          where: {
            userId: user.id,
            boardId: user.board.id,
            gameId: game.id,
          },
          include: {
            gameSession: true,
          },
        },
      },
    });

    await this.prismaService.gameAssignment.delete({
      where: {
        id: prismaGame.gameAssignment.shift().id,
      },
    });

    socket.emit('game:end', { isStarted: false });
  }
}
