import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/game' })
export class GameGateway implements OnModuleInit {
  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('game:start')
  handleStart(
    @MessageBody() data: { isAdmin: boolean },
    @ConnectedSocket() socket: Socket,
  ): void {
    console.log(data);
    if (!data.isAdmin) return;
    socket.to('game').emit('game:start', { isStarted: true });
  }

  onModuleInit(): void {
    this.server.on('connect', (socket: Socket) => {
      socket.join('game');
    });
  }
}
