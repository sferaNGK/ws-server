import { Module } from '@nestjs/common';
import { UserGateway } from '@/events/user/user.gateway';

@Module({
  providers: [UserGateway],
})
export class UserModule {}
