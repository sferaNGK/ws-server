import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserGateway } from '@/events/user/user.gateway';
import { PrismaService } from '@/prisma/prisma.service';
import { Socket, io } from 'socket.io-client';
import { createMock } from '@golevelup/ts-jest';

describe('UserGateway', () => {
  let app: INestApplication;
  let ioClient: Socket;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserGateway,
        {
          provide: PrismaService,
          useValue: createMock<PrismaService>(),
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await app.listen(8000);
    ioClient = io('http://localhost:8000/test', {
      autoConnect: false,
      transports: ['websocket'],
    });
  });

  it('should register a team and emit a code', (done) => {
    const teamName = 'testTeam';

    // Mock the prismaService.user.create method
    prismaService.user.create = jest.fn().mockResolvedValue({
      teamName,
      clientId: 'someClientId',
      role: 'PLAYER',
      code: '123456',
    });

    ioClient.connect();

    ioClient.on('connect', () => {
      ioClient.emit('user:registerTeam', { teamName });

      ioClient.on('user:registerTeam', (response) => {
        expect(response.code).toHaveLength(6);
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: {
            teamName,
            clientId: ioClient.id,
            role: 'PLAYER',
            code: response.code,
          },
        });

        ioClient.disconnect();
        done();
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
