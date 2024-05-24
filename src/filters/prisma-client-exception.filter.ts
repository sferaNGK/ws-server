import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Socket } from 'socket.io';
import { e } from '@/utils';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    const error = exception as Prisma.PrismaClientKnownRequestError;

    console.log(error.message);

    client.emit(ctx.getPattern(), {
      error: e(error.meta['modelName'] as string, error.code),
    });
  }
}
