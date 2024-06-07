import { Body, Controller, Get, Post } from '@nestjs/common';
import { DockerService } from './docker.service';
import { StartContainerDto } from '@/docker/dto';

@Controller('dockerode')
export class DockerController {
	constructor(private readonly dockerService: DockerService) {}

	@Get()
	async getAllContainers() {
		return this.dockerService.getAllContainers();
	}

	@Post('start')
	async startComposeContainer(@Body() body: StartContainerDto) {
		const { imageName } = body;
		return this.dockerService.startComposeContainer(imageName);
	}

	@Post('stop')
	async stopComposeContainer(@Body() body: StartContainerDto) {
		const { imageName } = body;
		return this.dockerService.stopComposeContainer(imageName);
	}
}
