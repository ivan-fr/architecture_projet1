import type { DatabaseSync } from 'node:sqlite';
import type { UserRepository } from '../../../domain/ports/userRepository.ts';
import { userOf } from '../../../domain/user.ts';

interface UserRow {
  id: string;
  name: string;
  email: string;
  rider_type: string;
}

/** Les usagers dans la base SQL de la ville. */
export function sqlUserRepository(database: DatabaseSync): UserRepository {
  return {
    async byId(id) {
      const row = database.prepare('select id, name, email, rider_type from users where id = ?').get(id) as UserRow | undefined;
      // La base peut avoir été modifiée à la main : chaque ligne relue repasse par la règle.
      return row === undefined ? undefined : userOf({ id: row.id, name: row.name, email: row.email, riderType: row.rider_type });
    },
    async add(raw) {
      const user = userOf(raw);
      database
        .prepare(
          `insert into users (id, name, email, rider_type) values (?, ?, ?, ?)
           on conflict (id) do update set name = excluded.name, email = excluded.email, rider_type = excluded.rider_type`,
        )
        .run(user.id, user.name, user.email, user.riderType);
    },
  };
}
