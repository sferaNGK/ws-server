import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit, UseFilters } from '@nestjs/common';
import { generateCode } from '@/utils';
import { PrismaClientExceptionFilter } from '@/filters';
import { AppLogger } from '@/app-logger/app-logger';
import { UserGatewayService } from '@/events/user/user-gateway.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseFilters(new PrismaClientExceptionFilter())
export class UserGateway implements OnModuleInit {
  constructor(
    private readonly userService: UserGatewayService,
    private readonly logger: AppLogger,
  ) {}

  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('user:registerTeam')
  async onRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      teamName: string;
    },
  ): Promise<void> {
    const { teamName } = data;
    const code = generateCode(6);

    const { user, board } = await this.userService.onRegisterTeam({
      teamName,
      code,
    });

    client.emit('user:registerTeam', { code: user.code, board: board });
  }

  @SubscribeMessage('user:verifyCode')
  async onVerifyCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string },
  ): Promise<void> {
    const { code } = data;
    const ip = client.handshake.address;

    const isVerified = await this.userService.onVerifyCode({
      code,
      ip,
      client,
    });

    client.emit('user:verifyCode', { success: isVerified });
  }

  onModuleInit(): any {
    this.server.on('connect', (client: Socket) => {
      this.logger.debug(
        'User connected: ' +
          [
            client.handshake.address,
            client.id,
            client.handshake.query.clientId as string,
          ].join(' '),
        UserGateway.name,
      );
    });
  }
}
