import type { DatabaseSync } from 'node:sqlite';
import { ongoingRideOf } from '../../../domain/ongoingRide.ts';
import type { OngoingRideRepository } from '../../../domain/ports/ongoingRideRepository.ts';

interface OngoingRideRow {
  user_id: string;
  from_station_id: string;
  started_at: string;
}

/** Les trajets en cours dans la base SQL. L'heure de départ est rangée en texte ISO, et redevient une date à la relecture. */
export function sqlOngoingRideRepository(database: DatabaseSync): OngoingRideRepository {
  return {
    async ofUser(userId) {
      const row = database
        .prepare('select user_id, from_station_id, started_at from ongoing_rides where user_id = ?')
        .get(userId) as OngoingRideRow | undefined;
      if (row === undefined) return undefined;
      return ongoingRideOf({ userId: row.user_id, fromStationId: row.from_station_id, startedAt: new Date(row.started_at) });
    },
    async save(raw) {
      const ride = ongoingRideOf(raw);
      database
        .prepare(
          `insert into ongoing_rides (user_id, from_station_id, started_at) values (?, ?, ?)
           on conflict (user_id) do update set from_station_id = excluded.from_station_id, started_at = excluded.started_at`,
        )
        .run(ride.userId, ride.fromStationId, ride.startedAt.toISOString());
    },
  };
}
