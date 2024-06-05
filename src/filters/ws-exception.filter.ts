import { Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter<T> implements ExceptionFilter {
	catch(exception: T) {
		// const ctx = host.switchToWs();
		// const client = ctx.getClient<Socket>();

		const error = exception as WsException;

		console.log(error.message, error.getError());

		// client.emit(ctx.getPattern(), {
		// 	error: e(error.meta['modelName'] as string, error.code),
		// });
	}
}
