import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { TeamnameCheckDto } from '@/user/dto';
import { FastifyReply } from 'fastify';
import { AddPointsDto } from '@/user/dto/add-points.dto';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('check')
	async checkTeamName(
		@Body() data: TeamnameCheckDto,
		@Res() response: FastifyReply,
	): Promise<void> {
		response.code(200).send(await this.userService.checkTeamName(data));
	}

	@Post('points')
	async addPoints(
		@Body() data: AddPointsDto,
		@Res() response: FastifyReply,
	): Promise<void> {
		response.code(200).send(await this.userService.addPoints(data));
	}
}
