import { Module } from '@nestjs/common';
import { GameGateway } from '@/events/game/game.gateway';
import { RedisModule } from '@/redis/redis.module';

@Module({
	providers: [GameGateway],
	imports: [RedisModule],
})
export class GameModule {}
