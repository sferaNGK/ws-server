import { Module } from '@nestjs/common';
import { ResultController } from './result.controller';

@Module({
	controllers: [ResultController],
	providers: [],
})
export class ResultModule {}
