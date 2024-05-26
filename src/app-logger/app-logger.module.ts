import { Global, Module } from '@nestjs/common';
import { AppLogger } from '@/app-logger/app-logger';

@Global()
@Module({
	providers: [AppLogger],
	exports: [AppLogger],
})
export class AppLoggerModule {}
