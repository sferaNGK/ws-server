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
	client: Socket;
}

export interface GameEndData {
	game: Game;
	teamName: string;
	points: number;
}

interface VerifyCodeSuccess {
	success: boolean;
	teamName: string;
}

interface VerifyCodeFailure {
	success: boolean;
	game: Game;
	isSessionStarted: boolean;
	teamName: string;
}

type VerifyCodeResult = VerifyCodeSuccess | VerifyCodeFailure;
