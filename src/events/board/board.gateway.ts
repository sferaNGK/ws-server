import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BoardTakePayload } from './interface';

const MAX_BOARDS = 5;

@WebSocketGateway()
export class BoardGateway {
	@SubscribeMessage('board:takePlace')
	async onTakePlace(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: BoardTakePayload,
	): Promise<any> {
		console.log(payload, client.id);
	}

	@SubscribeMessage('board:join')
	async onJoin(@ConnectedSocket() client: Socket): Promise<any> {
		client.emit('board:join', {
			boards: MAX_BOARDS,
		});
	}
}
