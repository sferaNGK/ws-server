import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
} from '@nestjs/common';
import { DockerService } from './docker.service';
import { StartContainerDto } from '@/docker/dto';

@Controller('dockerode')
export class DockerController {
	constructor(private readonly dockerService: DockerService) {}

	@Get('/')
	async getComposedContainers() {
		return this.dockerService.getComposedContainers();
	}

	@HttpCode(HttpStatus.OK)
	@Post('start')
	async startComposeContainer(@Body() body: StartContainerDto) {
		const { imageName } = body;
		return this.dockerService.startComposeContainer(imageName);
	}

	@HttpCode(HttpStatus.OK)
	@Post('stop')
	async stopComposeContainer(@Body() body: StartContainerDto) {
		const { imageName } = body;
		return this.dockerService.stopComposeContainer(imageName);
	}
}
