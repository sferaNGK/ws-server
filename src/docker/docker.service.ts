import { Injectable, NotFoundException } from '@nestjs/common';
import * as Docker from 'dockerode';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { fromEvent, map, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DockerService {
	private docker: Docker;

	constructor(
		@InjectQueue('docker') private readonly dockerQueue: Queue,
		private readonly configService: ConfigService,
	) {
		const isDockerized = this.configService.get('IS_DOCKERIZED');
		console.log(`IS_DOCKERIZED: ${isDockerized}`);

		if (!isDockerized) {
			this.docker = new Docker();
		} else {
			this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
		}
	}

	async getAllContainers() {
		return this.docker.listContainers({ all: true });
	}

	async getComposedContainers() {
		const containers = await this.getAllContainers();

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

	async startComposeContainer(projectName: string) {
		const composedContainers =
			await this.getContainersWithProjectName(projectName);

		await this.dockerQueue.add('start-compose-containers', composedContainers, {
			attempts: 3,
		});

		return { success: true, message: 'Контейнеры запущены.' };
	}

	async stopComposeContainer(projectName: string) {
		const composedContainers =
			await this.getContainersWithProjectName(projectName);

		await this.dockerQueue.add('stop-compose-containers', composedContainers, {
			attempts: 3,
		});

		return { success: true, message: 'Контейнеры остановлены.' };
	}

	async getLogsFromContainer(containerId: string) {
		const container = this.docker.getContainer(containerId);

		const oneHourAgo = new Date(Date.now() - 60 * 60 * 5000)
			.getTime()
			.toString()
			.slice(0, -3);

		return new Observable<string>((subscriber) => {
			container.logs(
				{
					stdout: true,
					stderr: true,
					follow: true,
					timestamps: true,
					since: oneHourAgo,
				},
				(err, logStream) => {
					if (err) {
						subscriber.error(err);
					} else {
						fromEvent(logStream, 'data')
							.pipe(map((data) => data.toString()))
							.subscribe(subscriber);

						logStream.on('end', () => {
							subscriber.complete();
						});
					}
				},
			);
		});
	}

	private async getContainersWithProjectName(projectName: string) {
		const containers = await this.getAllContainers();

		const composedContainers = containers.filter(
			(container) =>
				container.Labels['com.docker.compose.project'] === projectName,
		);

		if (composedContainers.length === 0)
			throw new NotFoundException('Контейнеры не найдены.');

		return composedContainers;
	}
}
