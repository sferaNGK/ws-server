import { Module } from '@nestjs/common';
import { UserGateway } from '@/events/user/user.gateway';
import { RedisModule } from '@/redis/redis.module';

@Module({
  providers: [UserGateway],
  imports: [RedisModule],
})
export class UserModule {}
