import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';
import { DockerController } from './docker.controller';
import { BullModule } from '@nestjs/bull';
import { DockerProcessor } from '@/docker/processors';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { DockerGateway } from './docker.gateway';

@Module({
	controllers: [DockerController],
	providers: [DockerService, DockerProcessor, DockerGateway],
	imports: [
		BullModule.registerQueue({ name: 'docker' }),
		BullBoardModule.forFeature({
			name: 'docker',
			adapter: BullAdapter,
		}),
	],
})
export class DockerModule {}
