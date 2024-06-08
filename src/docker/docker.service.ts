import { Injectable, NotFoundException } from '@nestjs/common';
import * as Docker from 'dockerode';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DockerService {
	private docker: Docker;

	constructor(@InjectQueue('docker') private readonly dockerQueue: Queue) {
		this.docker = new Docker();
	}

	async getAllContainers() {
		return this.docker.listContainers({ all: true });
	}

	async getComposedContainers() {
		const containers = await this.docker.listContainers({ all: true });

		const projectGroups = {};

		containers.forEach((container) => {
			const project = container.Labels['com.docker.compose.project'];
			if (project) {
				if (!projectGroups[project]) {
					projectGroups[project] = [];
				}
				projectGroups[project].push(container);
			}
		});

		return Object.entries(projectGroups).map(([key, value]) => ({
			name: key,
			containers: value,
		}));
	}

	async startComposeContainer(imageName: string) {
		const composedContainers = await this.getContainersWithImageName(imageName);

		await this.dockerQueue.add('start-compose-containers', composedContainers, {
			attempts: 3,
		});

		return { success: true, message: 'Контейнеры запущены.' };
	}

	async stopComposeContainer(imageName: string) {
		const composedContainers = await this.getContainersWithImageName(imageName);

		await this.dockerQueue.add('stop-compose-containers', composedContainers, {
			attempts: 3,
		});

		return { success: true, message: 'Контейнеры остановлены.' };
	}

	async getLogsFromContainer(containerId: string) {
		const container = this.docker.getContainer(containerId);

		return new Promise<AsyncIterable<string>>((resolve, reject) => {
			container.logs(
				{
					stdout: true,
					stderr: true,
					follow: true,
					timestamps: true,
				},
				(err, stream) => {
					if (err) {
						reject(err);
					} else {
						resolve(this.streamToAsyncIterable(stream));
					}
				},
			);
		});
	}

	private streamToAsyncIterable(
		stream: NodeJS.ReadableStream,
	): AsyncIterable<string> {
		return {
			[Symbol.asyncIterator](): AsyncIterator<string> {
				return {
					next(): Promise<IteratorResult<string>> {
						return new Promise((resolve, reject) => {
							stream.once('data', (chunk) => {
								resolve({ value: chunk.toString(), done: false });
							});
							stream.once('end', () => {
								resolve({ done: true, value: undefined });
							});
							stream.once('error', (err) => {
								reject(err);
							});
						});
					},
				};
			},
		};
	}

	private async getContainersWithImageName(imageName: string) {
		const containers = await this.getAllContainers();

		const composedContainers = containers.filter(
			(container) =>
				container.Labels['com.docker.compose.project'] === imageName,
		);

		if (composedContainers.length === 0)
			throw new NotFoundException('Контейнеры не найдены.');

		return composedContainers;
	}
}
