import { ongoingRideOf, type OngoingRide } from '../../domain/ongoingRide.ts';
import type { OngoingRideRepository } from '../../domain/ports/ongoingRideRepository.ts';

/** Les trajets en cours en mémoire, rangés par usager. */
export function inMemoryOngoingRideRepository(rides = new Map<string, OngoingRide>()): OngoingRideRepository {
  return {
    async ofUser(userId) {
      return rides.get(userId);
    },
    async save(raw) {
      const ride = ongoingRideOf(raw);
      rides.set(ride.userId, ride);
    },
  };
}
