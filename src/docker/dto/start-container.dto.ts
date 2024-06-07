import { IsString } from 'class-validator';

export class StartContainerDto {
	@IsString()
	imageName: string;
}
