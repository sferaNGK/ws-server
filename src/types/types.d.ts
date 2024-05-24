import { Socket } from 'socket.io';

export interface CreateGameSessionData {
  isAdmin: boolean;
  title: string;
}

export interface VerifyCodeHandler {
  code: string;
  ip: string;
  client: Socket;
}

export interface RegisterTeamHandler {
  teamName: string;
  code: string;
}
