import { Module } from '@nestjs/common';
import { UserModule as UserGatewayModule } from '@/events/user/user.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { GameModule } from '@/events/game/game.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@/redis/redis.module';
import { AppLoggerModule } from '@/app-logger/app-logger.module';
import { GameSessionModule } from './session/game-session.module';
import { UserModule } from './user/user.module';
import { SpecialtyModule } from '@/specialty/specialty.module';
import { DockerModule } from './docker/docker.module';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { CacheModule } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
	imports: [
		UserGatewayModule,
		PrismaModule,
		GameModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		CacheModule.registerAsync<RedisClientOptions>({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				store: redisStore,
				socket: {
					host: configService.get<string>('REDIS_HOST'),
					port: configService.get<number>('REDIS_PORT'),
				},
				username: configService.get<string>('REDIS_USER'),
				password: configService.get<string>('REDIS_PASSWORD'),
			}),
			isGlobal: true,
		}),
		AppLoggerModule,
		RedisModule,
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
					username: configService.get<string>('REDIS_USER'),
					password: configService.get<string>('REDIS_PASSWORD'),
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
