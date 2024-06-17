import { Test, TestingModule } from '@nestjs/testing';
import { DockerController } from '../docker.controller';
import { DockerService } from '../docker.service';
import { ContainerActionDto } from '@/docker/dto';

describe('DockerController', () => {
	let dockerController: DockerController;
	let dockerService: DockerService;

	const mockDockerService = {
		getComposedContainers: jest.fn(),
		startComposeContainer: jest.fn(),
		stopComposeContainer: jest.fn(),
	};

	const mockComposedContainers = [
		{
			name: 'project1',
			containers: [
				{
					Id: 'container1',
					Names: ['/container1'],
					Image: 'image1',
					State: 'running',
					Labels: {
						'com.docker.compose.project': 'project1',
					},
				},
				{
					Id: 'container2',
					Names: ['/container2'],
					Image: 'image2',
					State: 'exited',
					Labels: {
						'com.docker.compose.project': 'project1',
					},
				},
			],
		},
	];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [DockerController],
			providers: [
				{
					provide: DockerService,
					useValue: mockDockerService,
				},
			],
		}).compile();

		dockerController = module.get<DockerController>(DockerController);
		dockerService = module.get<DockerService>(DockerService);
	});

	describe('getComposedContainers', () => {
		it('should return composed containers', async () => {
			mockDockerService.getComposedContainers.mockResolvedValue(
				mockComposedContainers,
			);

			const result = await dockerController.getComposedContainers();
			expect(result).toEqual(mockComposedContainers);
			expect(dockerService.getComposedContainers).toHaveBeenCalled();
		});
	});

	describe('startComposeContainer', () => {
		it('should start compose containers', async () => {
			const dto: ContainerActionDto = { projectName: 'project1' };
			const response = { success: true, message: 'Контейнеры запущены.' };
			mockDockerService.startComposeContainer.mockResolvedValue(response);

			const result = await dockerController.startComposeContainer(dto);
			expect(result).toEqual(response);
			expect(dockerService.startComposeContainer).toHaveBeenCalledWith(
				'project1',
			);
		});
	});

	describe('stopComposeContainer', () => {
		it('should stop compose containers', async () => {
			const dto: ContainerActionDto = { projectName: 'project1' };
			const response = { success: true, message: 'Контейнеры остановлены.' };
			mockDockerService.stopComposeContainer.mockResolvedValue(response);

			const result = await dockerController.stopComposeContainer(dto);
			expect(result).toEqual(response);
			expect(dockerService.stopComposeContainer).toHaveBeenCalledWith(
				'project1',
			);
		});
	});
});
