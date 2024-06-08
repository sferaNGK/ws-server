import { IsString } from 'class-validator';

export class ContainerLogsDto {
	@IsString()
	containerId: string;
}
