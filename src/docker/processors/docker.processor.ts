import {
	OnQueueCompleted,
	OnQueueFailed,
	Process,
	Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import * as Docker from 'dockerode';
import { AppLogger } from '@/app-logger/app-logger';

@Processor('docker')
export class DockerProcessor {
	private readonly docker: Docker;

	constructor(private readonly logger: AppLogger) {
		this.docker = new Docker();
	}

	@OnQueueCompleted()
	onQueueCompleted(job: Job<Docker.ContainerInfo[]>) {
		this.logger.log(
			`🎯 Completed job ${job.id} ${job.data[0].Labels['com.docker.compose.project']}`,
			DockerProcessor.name,
		);
	}

	@OnQueueFailed()
	onQueueFailed(job: Job<Docker.ContainerInfo[]>) {
		this.logger.log(
			`🎯 Failed job ${job.id} ${job.data[0].Labels['com.docker.compose.project']} with reason: ${job.failedReason}`,
			DockerProcessor.name,
		);
	}

	@Process('start-compose-containers')
	async startComposedContainer(job: Job<Docker.ContainerInfo[]>) {
		const containers = job.data;

		for await (const container of containers) {
			await this.docker.getContainer(container.Id).start();
		}
	}

	@Process('stop-compose-containers')
	async stopComposedContainer(job: Job<Docker.ContainerInfo[]>) {
		const containers = job.data;

		for (const container of containers) {
			await this.docker.getContainer(container.Id).stop();
		}
	}
}
