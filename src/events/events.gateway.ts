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
import { generateCode } from '@/utils/generateCode';
import { PrismaClientExceptionFilter } from '@/filters/prisma-client-exception.filter';
import { Prisma } from '@prisma/client';

@WebSocketGateway({
  namespace: '/test',
  cors: '*',
})
@UseFilters(new PrismaClientExceptionFilter())
export class EventsGateway implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}

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
        clientId: client.id,
        role: 'PLAYER',
        code,
      },
    });

    client.emit('user:registerTeam', { code });
  }

  @SubscribeMessage('user:verifyCode')
  async onVerifyCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string; clientId: string },
  ): Promise<void> {
    const { code, clientId } = data;
    const user = await this.prismaService.user.findUnique({
      where: { clientId },
    });

    if (!user || !user.code) return;

    if (user.code !== code) {
      throw new Prisma.PrismaClientKnownRequestError('Неверный код.', {
        code: 'P2025',
        meta: {
          modelName: 'Code',
        },
        clientVersion: '5.13.0',
      });
    }

    const updatedUser = await this.prismaService.user.update({
      where: { clientId },
      data: {
        isVerified: true,
      },
    });

    client.emit('user:verifyCode', { success: updatedUser.isVerified });
  }

  onModuleInit(): any {
    this.server.on('connect', (client: Socket) => {
      console.log(client.id);
    });
  }
}
