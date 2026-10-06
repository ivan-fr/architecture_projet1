import { ongoingRideOf, type OngoingRide } from '../../domain/ongoingRide.ts';
import type { OngoingRideRepository } from '../../domain/ports/ongoingRideRepository.ts';

/** Les trajets en cours en mémoire, rangés par usager. */
export function inMemoryOngoingRideRepository(rides = new Map<string, OngoingRide>()): OngoingRideRepository {
  return {
    async ofUser(userId) {
      const ride = rides.get(userId);
      return ride && ongoingRideOf({ ...ride, startedAt: new Date(ride.startedAt) });
    },
    async save(raw) {
      const ride = ongoingRideOf(raw);
      rides.set(ride.userId, { ...ride, startedAt: new Date(ride.startedAt) });
    },
  };
}
