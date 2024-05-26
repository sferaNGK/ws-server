import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { TeamNameCheckDto } from '@/user/dto';
import { FastifyReply } from 'fastify';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('check')
	async checkTeamName(
		@Body() data: TeamNameCheckDto,
		@Res() response: FastifyReply,
	) {
		const { teamName } = data;
		const result = await this.userService.checkTeamName({ teamName });

		result.success
			? response.code(200).send(result)
			: response.code(400).send(result);
	}
}
