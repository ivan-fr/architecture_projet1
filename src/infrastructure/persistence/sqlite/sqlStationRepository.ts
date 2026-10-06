import type { DatabaseSync } from 'node:sqlite';
import type { StationRepository } from '../../../domain/ports/stationRepository.ts';
import { Station } from '../../../domain/station.ts';
import { inTransaction } from './sqliteDatabase.ts';

interface StationRow {
  id: string;
  docks: number;
}

interface BikeRow {
  bike_id: string;
}

/**
 * Les stations dans la base SQL : une ligne par station, une ligne par vélo à quai.
 * C'est le seul fichier où une station devient plate, et le seul où elle redevient une station.
 */
export function sqlStationRepository(database: DatabaseSync): StationRepository {
  return {
    async byId(id) {
      const row = database.prepare('select id, docks from stations where id = ?').get(id) as StationRow | undefined;
      if (row === undefined) return undefined;
      const bikes = database.prepare('select bike_id from station_bikes where station_id = ? order by position').all(id) as unknown as BikeRow[];
      // Station.of fait repasser chaque vélo par la règle : une base qui ment est refusée.
      return Station.of({ id: row.id, docks: row.docks, bikes: bikes.map((bike) => bike.bike_id) });
    },
    async save(station) {
      inTransaction(database, () => {
        database
          .prepare('insert into stations (id, docks) values (?, ?) on conflict (id) do update set docks = excluded.docks')
          .run(station.id, station.docks);
        database.prepare('delete from station_bikes where station_id = ?').run(station.id);
        const insertBike = database.prepare('insert into station_bikes (station_id, bike_id, position) values (?, ?, ?)');
        station.bikes.forEach((bikeId, position) => insertBike.run(station.id, bikeId, position));
      });
    },
  };
}
