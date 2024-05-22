import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RemoteSocket, Server, Socket } from 'socket.io';
import { PrismaService } from '@/prisma/prisma.service';
import { assignRandomGames } from '@/utils';
import { Game } from '@prisma/client';
import { RedisService } from '@/redis/redis.service';
import { createGameSessionData } from '@/types';
import { AppLogger } from '@/app-logger/app-logger';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AppLogger,
    private readonly redisService: RedisService,
  ) {}

  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('game:join')
  handleJoin(@ConnectedSocket() socket: Socket): void {
    socket.join('game');
  }

  @SubscribeMessage('game:createGameSession')
  async handleCreateGameSession(
    @MessageBody() data: createGameSessionData,
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

    client.emit('game:createGameSession', { isCreated: true, gameSession });
  }

  @SubscribeMessage('game:start')
  async handleStart(@MessageBody() data: { isAdmin: boolean }): Promise<void> {
    if (!data.isAdmin) return;
    const games = await this.prismaService.game.findMany();
    const users = await this.server.in('game').fetchSockets();
    const assignments = assignRandomGames(users, games);

    assignments.forEach(
      (socket: { user: RemoteSocket<any, any>; game: Game }) => {
        socket.user.emit('game:start', { isStarted: true, game: socket.game });
      },
    );
  }
}
