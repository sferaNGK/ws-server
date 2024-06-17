import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	UseInterceptors,
} from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('specialties')
export class SpecialtyController {
	constructor(private readonly specialtyService: SpecialtyService) {}

	@HttpCode(HttpStatus.OK)
	@UseInterceptors(CacheInterceptor)
	@CacheKey('specialties')
	@CacheTTL(1000 * 60)
	@Get()
	async getAll() {
		return this.specialtyService.getAll();
	}
}
