import { Module } from '@nestjs/common';
import { RedisModule } from '@/redis/redis.module';
import { MyGameGateway } from '@/events/mygame/mygame.gateway';

@Module({
	providers: [MyGameGateway],
	imports: [RedisModule],
})
export class MyGameModule {}
