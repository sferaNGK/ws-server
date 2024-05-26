import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TeamnameCheckDto } from '@/user/dto';
import { AddPointsDto } from '@/user/dto/add-points.dto';

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async checkTeamName({ teamName }: TeamnameCheckDto) {
		const user = await this.prismaService.user.findFirst({
			where: { teamName },
		});

		if (!user) throw new NotFoundException('Команда не найдена.');

		return { success: true };
	}

	async addPoints({ teamName, points, users }: AddPointsDto) {
		return this.prismaService.$transaction(async (prisma) => {
			if (users) {
				const prismaUsers = [];
				for (const user of users) {
					const prismaUser = await prisma.user.findFirst({
						where: { teamName: user.teamName },
					});

					if (!prismaUser) throw new NotFoundException('Команда не найдена.');

					prismaUsers.push(
						await prisma.user.update({
							where: { id: prismaUser.id },
							data: { points: prismaUser.points + user.points },
							select: {
								id: true,
								teamName: true,
								points: true,
							},
						}),
					);
				}

				return { success: true, users: prismaUsers };
			} else {
				const user = await prisma.user.findFirst({
					where: { teamName },
				});

				if (!user) throw new NotFoundException('Команда не найдена.');

				const updatedUser = await prisma.user.update({
					where: { id: user.id },
					data: { points: user.points + points },
					select: {
						id: true,
						teamName: true,
						points: true,
					},
				});

				return { success: true, user: updatedUser };
			}
		});
	}
}
