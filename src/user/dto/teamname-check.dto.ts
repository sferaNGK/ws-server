import { IsNotEmpty, IsString } from 'class-validator';

export class TeamnameCheckDto {
	@IsString({ message: 'Название команды должно быть строкой.' })
	@IsNotEmpty({ message: 'Название команды не может быть пустым.' })
	teamName: string;
}
