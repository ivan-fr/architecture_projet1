import { assertBikeDeparture, assertBikeArrival } from '../../domain/bikeMovement.ts';
import type { OngoingRide } from '../../domain/ongoingRide.ts';
import type { Station } from '../../domain/station.ts';
import { bikeRideOf, type BikeRide } from '../../domain/bikeRide.ts';
import type { BikeMovementRepository } from '../../domain/ports/bikeMovementRepository.ts';
import { assertCurrentStation, copyStation } from '../stationSnapshot.ts';

/** Les opérations synchrones sur ces deux maps forment le commit du double en mémoire. */
export function inMemoryBikeMovementRepository(seed: Station[] = [], rides = new Map<string, OngoingRide>()): BikeMovementRepository {
  const stations = new Map(seed.map((station) => [station.id, copyStation(station)]));
  return {
    async byStation(id) { const station = stations.get(id); return station && copyStation(station); },
    async rideOfUser(userId) { const ride = rides.get(userId); return ride && bikeRideOf(ride as BikeRide); },
    async take(before, after, raw) {
      const ride = bikeRideOf(raw);
      assertBikeDeparture(before, after, ride);
      assertCurrentStation(before, stations.get(before.id));
      if (rides.has(ride.userId)) throw new Error(`${ride.userId} is already riding`);
      const saved = copyStation(after);
      rides.set(ride.userId, ride);
      stations.set(saved.id, saved);
    },
    async return(before, after, raw, endedAt) {
      const ride = bikeRideOf(raw);
      assertBikeArrival(before, after, ride, endedAt);
      assertCurrentStation(before, stations.get(before.id));
      const current = rides.get(ride.userId) as BikeRide | undefined;
      if (!current || current.bikeId !== ride.bikeId || current.startedAt.getTime() !== ride.startedAt.getTime()) throw new Error('the ride is no longer active');
      const saved = copyStation(after);
      rides.delete(ride.userId);
      stations.set(saved.id, saved);
    },
  };
}
