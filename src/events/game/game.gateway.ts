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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway {
  constructor(private readonly prismaService: PrismaService) {}

  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('game:join')
  handleJoin(@ConnectedSocket() socket: Socket): void {
    socket.join('game');
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
