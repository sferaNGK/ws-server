import { Controller, Get } from '@nestjs/common';
import { GameSessionService } from '@/session/game-session.service';

@Controller('session')
export class GameSessionController {
	constructor(private readonly gameSessionService: GameSessionService) {}

	@Get()
	async getSessions() {
		return this.gameSessionService.getGameSessions();
	}
}
