import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TeamNameCheckDto } from '@/user/dto';

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async checkTeamName({ teamName }: TeamNameCheckDto) {
		const user = await this.prismaService.user.findFirst({
			where: { teamName },
		});

		if (!user) return { success: false };

		return { success: true };
	}
}
