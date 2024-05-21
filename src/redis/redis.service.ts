import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService extends Redis {
  constructor(private readonly configService: ConfigService) {
    super({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      username: configService.get('REDIS_USER') ?? '',
      password: configService.get('REDIS_PASSWORD') ?? '',
    });
  }
}
