import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
} from '@nestjs/common';
import { DockerService } from '@/docker/docker.service';
import { ContainerActionDto } from '@/docker/dto';

@Controller('dockerode')
export class DockerController {
	constructor(private readonly dockerService: DockerService) {}

	@Get()
	async getComposedContainers() {
		return this.dockerService.getComposedContainers();
	}

	@HttpCode(HttpStatus.OK)
	@Post('start')
	async startComposeContainer(@Body() body: ContainerActionDto) {
		const { projectName } = body;
		return this.dockerService.startComposeContainer(projectName);
	}

	@HttpCode(HttpStatus.OK)
	@Post('stop')
	async stopComposeContainer(@Body() body: ContainerActionDto) {
		const { projectName } = body;
		return this.dockerService.stopComposeContainer(projectName);
	}
}
