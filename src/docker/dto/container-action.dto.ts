import { IsString } from 'class-validator';

export class ContainerActionDto {
	@IsString()
	projectName: string;
}
