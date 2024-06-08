import { Module } from '@nestjs/common';
import { UserModule as UserGatewayModule } from '@/events/user/user.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { GameModule } from '@/events/game/game.module';
import { ResultModule } from './result/result.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@/redis/redis.module';
import { MyGameModule } from '@/events/mygame/mygame.module';
import { AppLoggerModule } from '@/app-logger/app-logger.module';
import { GameSessionModule } from './session/game-session.module';
import { UserModule } from './user/user.module';
import { SpecialtyModule } from '@/specialty/specialty.module';
import { DockerModule } from './docker/docker.module';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';

@Module({
	imports: [
		UserGatewayModule,
		PrismaModule,
		GameModule,
		ResultModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		AppLoggerModule,
		RedisModule,
		MyGameModule,
		AppLoggerModule,
		GameSessionModule,
		UserModule,
		SpecialtyModule,
		DockerModule,
		BullModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				redis: {
					host: configService.get<string>('REDIS_HOST'),
					port: configService.get<number>('REDIS_PORT'),
				},
			}),
		}),
		BullBoardModule.forRoot({
			route: '/bull-board',
			adapter: FastifyAdapter,
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
