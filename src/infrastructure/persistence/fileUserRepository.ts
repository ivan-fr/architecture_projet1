import { readFile, writeFile } from 'node:fs/promises';
import { userOf, type RawUser, type User } from '../../domain/user.ts';
import type { UserRepository } from '../../domain/ports/userRepository.ts';

/** Les usagers dans un fichier JSON : ils survivent à l'arrêt du logiciel. */
export function fileUserRepository(path: string): UserRepository {
  /** Un fichier absent n'est pas une panne : c'est un service qui n'a encore aucun usager. */
  async function readAll(): Promise<User[]> {
    try {
      // Le fichier peut avoir été modifié à la main : chaque usager relu repasse par la règle.
      return (JSON.parse(await readFile(path, 'utf8')) as RawUser[]).map(userOf);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async function writeAll(users: User[]): Promise<void> {
    await writeFile(path, JSON.stringify(users, null, 2));
  }

  return {
    async byId(id) {
      return (await readAll()).find((user) => user.id === id);
    },
    async add(raw) {
      const user = userOf(raw);
      const others = (await readAll()).filter((known) => known.id !== user.id);
      await writeAll([...others, user]);
    },
  };
}
