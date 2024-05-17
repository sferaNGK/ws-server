import { Module } from '@nestjs/common';
import { GameGateway } from '@/events/game/game.gateway';

@Module({
  providers: [GameGateway],
})
export class GameModule {}
