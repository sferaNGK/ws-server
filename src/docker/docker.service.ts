import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';

@Injectable()
export class DockerService {
	private docker: Docker;

	constructor() {
		this.docker = new Docker();
	}

	async getAllContainers() {
		return this.docker.listContainers({ all: true });
	}

	async startComposeContainer(imageName: string) {
		const containers = await this.getAllContainers();

		const composedContainers = containers.filter(
			(container) =>
				container.Labels['com.docker.compose.project'] === imageName,
		);

		for (const container of composedContainers) {
			await this.docker.getContainer(container.Id).start();
		}

		return { success: true, message: 'Контейнеры запущены.' };
	}

	async stopComposeContainer(imageName: string) {
		const containers = await this.getAllContainers();

		const composedContainers = containers.filter(
			(container) =>
				container.Labels['com.docker.compose.project'] === imageName,
		);

		for (const container of composedContainers) {
			await this.docker.getContainer(container.Id).stop();
		}

		return { success: true, message: 'Контейнеры остановлены.' };
	}
}
