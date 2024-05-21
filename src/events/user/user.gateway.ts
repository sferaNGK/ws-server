import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit, UseFilters } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { generateCode } from '@/utils';
import { PrismaClientExceptionFilter } from '@/filters';
import { Prisma } from '@prisma/client';
import { AppLogger } from '@/app-logger/app-logger';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseFilters(new PrismaClientExceptionFilter())
export class UserGateway implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
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

    await this.prismaService.user.create({
      data: {
        teamName,
        role: 'PLAYER',
        code,
      },
    });

    client.emit('user:registerTeam', { code });
  }

  @SubscribeMessage('user:verifyCode')
  async onVerifyCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string },
  ): Promise<void> {
    const { code } = data;
    const user = await this.prismaService.user.findFirst({
      where: { code },
    });

    if (!user)
      throw new Prisma.PrismaClientKnownRequestError('Неверный код.', {
        code: 'P2025',
        meta: {
          modelName: 'Code',
        },
        clientVersion: '5.13.0',
      });

    const updatedUser = await this.prismaService.user.update({
      where: { code },
      data: {
        clientId: client.id,
        isVerified: true,
        code: null,
      },
    });

    client.emit('user:verifyCode', { success: updatedUser.isVerified });
  }

  onModuleInit(): any {
    this.server.on('connect', (client: Socket) => {
      this.logger.debug(
        [client.handshake.address, client.id].join(' '),
        'UserGateway',
      );
    });
  }
}
