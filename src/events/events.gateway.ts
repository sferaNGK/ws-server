import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({ namespace: '/test' })
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  private code = '1234';
  private clientId: string = 'dAF7SAnjAS_';
  private roomId: string = 'lutaya-komnata-dlya-testa';

  @SubscribeMessage('game:start')
  onStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: string },
  ): any {
    if (data.clientId !== this.clientId) {
      return;
    }

    this.server
      .to(this.roomId)
      .emit('game:start', { msg: 'Да начнется рубилово...' });
  }

  @SubscribeMessage('user:registerTeam')
  onRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      clientId: string;
      teamName: string;
      code: string;
    },
  ): any {
    const { clientId, teamName, code } = data;
    this.server.emit('user:registerTeam', { clientId, teamName, code });
  }

  @SubscribeMessage('user:verifyCode')
  onVerifyCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string; clientId: string },
  ): any {
    const { code, clientId } = data;
    client.emit('user:verifyCode', { success: code === this.code });
  }

  onModuleInit(): any {
    this.server.on('connect', (client: Socket) => {
      client.join(this.roomId);
      console.log(client.rooms);
    });
  }
}
