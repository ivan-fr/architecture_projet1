import type { DatabaseSync } from 'node:sqlite';
import { stationFollowOf } from '../../../domain/stationFollow.ts';
import type { StationFollowerRepository } from '../../../domain/ports/stationFollowerRepository.ts';

export function sqlStationFollowerRepository(database: DatabaseSync): StationFollowerRepository {
  return {
    async follow(raw) {
      const { userId, stationId } = stationFollowOf(raw);
      database.prepare('insert into station_followers (station_id, user_id) values (?, ?) on conflict (station_id, user_id) do nothing')
        .run(stationId, userId);
    },
    async followersOf(stationId) {
      return database.prepare('select user_id from station_followers where station_id = ? order by rowid')
        .all(stationId).map((row) => row.user_id as string);
    },
  };
}
