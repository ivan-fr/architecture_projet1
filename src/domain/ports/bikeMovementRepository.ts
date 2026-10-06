import type { Station } from '../station.ts';
import type { BikeRide } from '../bikeRide.ts';

/** Le mouvement et le trajet sont enregistrés ensemble, ou pas du tout. */
export interface BikeMovementRepository {
  byStation(id: string): Promise<Station | undefined>;
  rideOfUser(userId: string): Promise<BikeRide | undefined>;
  take(before: Station, after: Station, ride: BikeRide): Promise<void>;
  return(before: Station, after: Station, ride: BikeRide, endedAt: Date): Promise<void>;
}
