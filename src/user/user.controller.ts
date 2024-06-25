import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
} from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { TeamNameCheckDto } from '@/user/dto';
import { UserCheckResponse } from '@/user/interface';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('check')
	@HttpCode(HttpStatus.OK)
	async checkTeamName(
		@Body() data: TeamNameCheckDto,
	): Promise<UserCheckResponse> {
		return this.userService.checkTeamName(data);
	}

	@Get('current-session')
	@HttpCode(HttpStatus.OK)
	async getUsersInCurrentSession() {
		return this.userService.getUsersInCurrentSession();
	}
}
