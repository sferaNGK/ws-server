import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SpecialtyService {
	constructor(private readonly prismaService: PrismaService) {}

	async getAll() {
		return this.prismaService.specialty.findMany();
	}
}
