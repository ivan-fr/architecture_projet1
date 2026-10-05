import { userOf, type User } from '../../domain/user.ts';
import type { UserRepository } from '../../domain/ports/userRepository.ts';

/** Les usagers en mémoire : rapides, jetables, pour tester un cas d'usage sans fichier. */
export function inMemoryUserRepository(seed: User[] = []): UserRepository {
  const users = new Map(seed.map(userOf).map((user) => [user.id, user]));
  return {
    async byId(id) {
      return users.get(id);
    },
    async add(raw) {
      const user = userOf(raw);
      users.set(user.id, user);
    },
  };
}
