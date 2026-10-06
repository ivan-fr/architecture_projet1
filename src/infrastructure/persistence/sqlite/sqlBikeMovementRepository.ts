import type { DatabaseSync } from 'node:sqlite';
import { bikeRideOf, assertBikeReturn, type BikeRide } from '../../../domain/bikeRide.ts';
import type { BikeMovementRepository } from '../../../domain/ports/bikeMovementRepository.ts';
import { assertCurrentStation } from '../../stationSnapshot.ts';
import { inTransaction } from './sqliteDatabase.ts';
import { readStation, writeStation } from './sqlStationRepository.ts';

function activeRide(database: DatabaseSync, userId: string): BikeRide | undefined {
  const row = database.prepare('select * from rides where user_id = ? and ended_at is null order by started_at desc limit 1').get(userId);
  if (!row) return undefined;
  return bikeRideOf({ userId: String(row.user_id), fromStationId: String(row.from_station_id), startedAt: new Date(String(row.started_at)), bikeId: row.bike_id as string });
}

export function sqlBikeMovementRepository(database: DatabaseSync): BikeMovementRepository {
  return {
    async byStation(id) { return readStation(database, id); },
    async rideOfUser(userId) { return activeRide(database, userId); },
    async take(before, after, raw) {
      const ride = bikeRideOf(raw);
      inTransaction(database, () => {
        assertCurrentStation(before, readStation(database, before.id));
        if (database.prepare('select 1 from rides where user_id = ? and ended_at is null').get(ride.userId)) throw new Error(`${ride.userId} is already riding`);
        writeStation(database, after);
        database.prepare('insert into rides (user_id, from_station_id, started_at, bike_id) values (?, ?, ?, ?)')
          .run(ride.userId, ride.fromStationId, ride.startedAt.toISOString(), ride.bikeId);
      });
    },
    async return(before, after, raw, endedAt) {
      const ride = bikeRideOf(raw);
      assertBikeReturn(ride, endedAt);
      inTransaction(database, () => {
        assertCurrentStation(before, readStation(database, before.id));
        const current = activeRide(database, ride.userId);
        if (!current || current.bikeId !== ride.bikeId || current.startedAt.getTime() !== ride.startedAt.getTime()) throw new Error('the ride is no longer active');
        writeStation(database, after);
        database.prepare('update rides set ended_at = ? where user_id = ? and started_at = ?')
          .run(endedAt.toISOString(), ride.userId, ride.startedAt.toISOString());
      });
    },
  };
}
