import { Game } from '@prisma/client';
import { RemoteSocket } from 'socket.io';

export function assignRandomGames(
  users: RemoteSocket<any, any>[],
  games: Game[],
) {
  const shuffledGames = games.sort(() => Math.random() - 0.5);

  const assignments = [];
  for (let i = 0; i < users.length; i++) {
    if (shuffledGames.length === 0) {
      break;
    }

    const game = shuffledGames.pop();
    assignments.push({
      user: users[i],
      game: game,
    });
  }

  return assignments;
}
