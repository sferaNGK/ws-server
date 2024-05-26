import {
	IsInt,
	IsNotEmpty,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddPointsDto {
	@ValidateIf((o) => !o.users)
	@IsString({ message: 'Название команды должно быть строкой.' })
	@IsNotEmpty({ message: 'Название команды не может быть пустым.' })
	teamName: string;

	@ValidateIf((o) => !o.users)
	@IsInt({ message: 'Количество очков должно быть целым числом.' })
	points: number;

	@ValidateIf((o) => !o.teamName && !o.points)
	@ValidateNested({ each: true })
	@Type(() => UserDto)
	users: {
		teamName: string;
		points: number;
	}[];
}

export class UserDto {
	@IsString({ message: 'Название команды должно быть строкой.' })
	@IsNotEmpty({ message: 'Название команды не может быть пустым.' })
	teamName: string;

	@IsInt({ message: 'Количество очков должно быть целым числом.' })
	points: number;
}
