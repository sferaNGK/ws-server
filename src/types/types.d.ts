import { Socket } from 'socket.io';
import { Game } from '@prisma/client';

export interface CreateGameSessionData {
  isAdmin: boolean;
  title: string;
}

export interface VerifyCodeData {
  code: string;
  ip: string;
  client: Socket;
}

export interface RegisterTeamData {
  teamName: string;
  code: string;
}

export interface GameEndData {
  game: Game;
}
