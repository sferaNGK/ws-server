import { Module } from '@nestjs/common';
import { GameSessionController } from './game-session.controller';
import { GameSessionService } from './game-session.service';

@Module({
	controllers: [GameSessionController],
	providers: [GameSessionService],
})
export class GameSessionModule {}
