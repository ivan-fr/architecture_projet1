import type { DatabaseSync } from 'node:sqlite';
import { ongoingRideOf } from '../../../domain/ongoingRide.ts';
import type { OngoingRideRepository } from '../../../domain/ports/ongoingRideRepository.ts';

interface RideRow {
  user_id: string;
  from_station_id: string;
  started_at: string;
}

/**
 * Les trajets dans la base SQL, gardés en historique : chaque départ ajoute une ligne.
 * Le trajet en cours d'un usager est son départ le plus récent. L'heure est rangée en texte ISO.
 */
export function sqlOngoingRideRepository(database: DatabaseSync): OngoingRideRepository {
  return {
    async ofUser(userId) {
      const row = database
        .prepare('select user_id, from_station_id, started_at from rides where user_id = ? order by started_at desc limit 1')
        .get(userId) as RideRow | undefined;
      if (row === undefined) return undefined;
      return ongoingRideOf({ userId: row.user_id, fromStationId: row.from_station_id, startedAt: new Date(row.started_at) });
    },
    async save(raw) {
      const ride = ongoingRideOf(raw);
      // Le même départ enregistré deux fois ne compte qu'une fois.
      database
        .prepare(
          `insert into rides (user_id, from_station_id, started_at) values (?, ?, ?)
           on conflict (user_id, started_at) do update set from_station_id = excluded.from_station_id`,
        )
        .run(ride.userId, ride.fromStationId, ride.startedAt.toISOString());
    },
  };
}
