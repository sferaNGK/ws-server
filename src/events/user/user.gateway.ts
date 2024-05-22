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
import { RedisService } from '@/redis/redis.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseFilters(new PrismaClientExceptionFilter())
export class UserGateway implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AppLogger,
    private readonly redis: RedisService,
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
    const ip = client.handshake.address;

    const user = await this.prismaService.user.findFirst({
      where: { code },
    });

    const board = await this.prismaService.board.findUnique({
      where: { ip },
    });

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
        clientId: client.id,
        isVerified: true,
        code: null,
      },
    });

    const updatedBoard = await this.prismaService.board.update({
      where: { ip },
      data: {
        isBusy: true,
      },
    });

    if (await this.redis.get('currentGameSession')) {
      //
    }

    client.emit('user:verifyCode', { success: updatedUser.isVerified });
  }

  onModuleInit(): any {
    this.server.on('connect', (client: Socket) => {
      this.logger.debug(
        [client.handshake.address, client.id].join(' '),
        UserGateway.name,
      );
    });
  }
}
