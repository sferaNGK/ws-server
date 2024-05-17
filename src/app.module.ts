import { Module } from '@nestjs/common';
import { UserModule } from '@/events/user/user.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { GameModule } from '@/events/game/game.module';

@Module({
  imports: [UserModule, PrismaModule, GameModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
