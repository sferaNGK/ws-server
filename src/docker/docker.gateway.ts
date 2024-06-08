import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { DockerService } from '@/docker/docker.service';
import { Server, Socket } from 'socket.io';
import { ContainerLogsDto } from '@/docker/dto/container-logs.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class DockerGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly dockerService: DockerService) {}

	@SubscribeMessage('docker:streamLogs')
	async onContainerLogs(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ContainerLogsDto,
	): Promise<void> {
		const { containerId } = body;
		client.join(containerId);

		const logStream =
			await this.dockerService.getLogsFromContainer(containerId);
		for await (const log of logStream) {
			this.server.to(containerId).emit('docker:streamLogs', log);
		}
	}
}
