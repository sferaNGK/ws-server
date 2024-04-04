import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/events' })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): any {
    this.server.emit('onMessage', { client: client.id, message: payload });
  }
}
