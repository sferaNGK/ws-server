import { Module } from '@nestjs/common';
import { UserGateway } from '@/events/user.gateway';

@Module({
  providers: [UserGateway],
})
export class UserModule {}
