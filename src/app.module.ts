import { Module } from '@nestjs/common';
import { UserModule } from '@/events/user/user.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { GameModule } from '@/events/game/game.module';
import { ResultModule } from './result/result.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@/redis/redis.module';
import { MyGameModule } from '@/events/mygame/mygame.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    GameModule,
    ResultModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    MyGameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
