import { Module } from '@nestjs/common';
import { UserGateway } from '@/events/user/user.gateway';
import { RedisModule } from '@/redis/redis.module';
import { UserGatewayService } from '@/events/user/user-gateway.service';

@Module({
  providers: [UserGateway, UserGatewayService],
  imports: [RedisModule],
})
export class UserModule {}
