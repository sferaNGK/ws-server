import { DockerService } from '@/docker/docker.service';
import * as Docker from 'dockerode';
import { Test, TestingModule } from '@nestjs/testing';
import { BullModule } from '@nestjs/bull';

describe('DockerService', () => {
	let dockerService: DockerService;
	let docker: jest.Mocked<Docker>;

	beforeEach(async () => {
		docker = new Docker() as jest.Mocked<Docker>;

		const module: TestingModule = await Test.createTestingModule({
			imports: [BullModule.registerQueue({ name: 'docker' })],
			providers: [
				DockerService,
				{
					provide: Docker,
					useValue: docker,
				},
			],
		}).compile();

		dockerService = module.get<DockerService>(DockerService);
		dockerService['docker'] = docker;
	});

	it('should be defined', () => {
		expect(dockerService).toBeDefined();
	});
});
