import { Test, TestingModule } from '@nestjs/testing';
import { DockerGateway } from '../docker.gateway';
import { DockerService } from '../docker.service';
import { ContainerLogsDto } from '../dto';
import { Server, Socket } from 'socket.io';
import { Readable } from 'stream';

jest.mock('@nestjs/common/services/logger.service');

describe('DockerGateway', () => {
	let gateway: DockerGateway;
	let dockerService: DockerService;
	let server: Server;

	const mockDockerService = {
		getLogsFromContainer: jest.fn(),
	};

	const mockLogStream = new Readable({
		read() {
			this.push('log data');
			this.push(null);
		},
	});

	const mockErrorStream = new Readable({
		read() {
			this.emit('error', new Error('Stream error'));
		},
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DockerGateway,
				{
					provide: DockerService,
					useValue: mockDockerService,
				},
			],
		}).compile();

		gateway = module.get<DockerGateway>(DockerGateway);
		dockerService = module.get<DockerService>(DockerService);
		server = {
			to: jest.fn().mockReturnValue({
				emit: jest.fn(),
			}),
		} as unknown as Server;

		gateway.server = server;
	});

	it('should be defined', () => {
		expect(gateway).toBeDefined();
	});

	it('should handle docker:streamLogs and emit logs', async () => {
		const containerId = 'testContainerId';
		const dto: ContainerLogsDto = { containerId };

		mockDockerService.getLogsFromContainer.mockReturnValue(mockLogStream);

		const client = {
			join: jest.fn(),
		} as unknown as Socket;

		await gateway.onContainerLogs(client, dto);

		expect(client.join).toHaveBeenCalledWith(containerId);
		expect(mockDockerService.getLogsFromContainer).toHaveBeenCalledWith(
			containerId,
		);

		await new Promise((resolve) => {
			mockLogStream.on('end', resolve);
		});

		expect(server.to).toHaveBeenCalledWith(containerId);
		expect(server.to(containerId).emit).toHaveBeenCalledWith(
			'docker:streamLogs',
			'log data',
		);
	});

	it('should log error if stream emits error', async () => {
		const containerId = 'testContainerId';
		const dto: ContainerLogsDto = { containerId };

		mockDockerService.getLogsFromContainer.mockReturnValue(mockErrorStream);

		const client = {
			join: jest.fn(),
		} as unknown as Socket;

		const logger = gateway['logger'];
		const loggerErrorSpy = jest.spyOn(logger, 'error');

		await gateway.onContainerLogs(client, dto);

		expect(client.join).toHaveBeenCalledWith(containerId);
		expect(mockDockerService.getLogsFromContainer).toHaveBeenCalledWith(
			containerId,
		);

		await new Promise((resolve) => {
			mockErrorStream.on('error', resolve);
		});

		expect(loggerErrorSpy).toHaveBeenCalledWith(
			'Stream error',
			expect.any(String),
		);
	});
});
