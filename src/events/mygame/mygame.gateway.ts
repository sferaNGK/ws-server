import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MyGameGateway {
  private users: any = [];
  private userQueue: any = [];
  private activeUser: any = null;
  private activeQuestion: any = null;

  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('myGame:joinGame')
  onMyGameJoin(@MessageBody() user: any, @ConnectedSocket() client: Socket) {
    if (user) {
      if (!this.users.find((item) => item.username === user.username)) {
        this.users.push(user);
        client.emit('myGame:myUser', user);
      } else {
        client.emit(
          'myGame:myUser',
          this.users.find((item) => item.username === user.username),
        );
      }
    }

    this.server.emit('myGame:all', this.users);
    this.server.emit('myGame:setActiveQuestion', this.activeQuestion);
  }

  @SubscribeMessage('myGame:changeUser')
  onChangeUser() {
    this.changeUser();
    this.server.emit('myGame:newActiveUser', this.activeUser);
  }

  @SubscribeMessage('myGame:addPoints')
  onAddPoints(@MessageBody() data: any) {
    if (this.activeUser) {
      this.users.find(
        (user: any) => user.username === data.activeUser.username,
      ).points += +data.points;
      this.userQueue = [];
    }

    this.server.emit('myGame:newUserList', this.users);
  }

  @SubscribeMessage('myGame:reassignPoints')
  onReassignPoints(@MessageBody() data: any) {
    const { lastAnsweredUser, points } = data;
    if (this.activeUser) {
      this.users.find(
        (user: any) => user.username === lastAnsweredUser.username,
      ).points -= +points;
      this.userQueue = [];
    }

    this.server.emit('myGame:newUserList', this.users);
  }

  @SubscribeMessage('myGame:closeQuestion')
  onCloseQuestion() {
    this.activeQuestion = null;
    this.server.emit('myGame:setActiveQuestion', this.activeQuestion);
  }

  @SubscribeMessage('myGame:selectQuestion')
  onSelectQuestion(@MessageBody() data: any) {
    const { question } = data;
    this.userQueue.length = 0;
    this.activeQuestion = question;

    this.server.emit('myGame:setActiveQuestion', this.activeQuestion);
  }

  @SubscribeMessage('myGame:answerQuestion')
  onAnswerQuestion(@MessageBody() data: any) {
    const { user } = data;
    if (this.userQueue.find((item: any) => item.username == user.username)) {
      console.log('1231231');
    }

    this.userQueue.push(user);

    if (!this.activeUser) {
      this.activeUser = this.userQueue[0];

      this.server.emit('myGame:getActiveUser', this.activeUser);
    }

    this.server.emit('myGame:getQueue', this.userQueue);
  }

  changeUser() {
    let index = this.userQueue.indexOf(this.activeUser) + 1;

    if (index === this.userQueue.length) {
      index = 0;
      this.activeUser = this.userQueue[index];
      return;
    }
    this.activeUser = this.userQueue[index];
  }
}
