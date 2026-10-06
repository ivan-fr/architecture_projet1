import { ongoingRideOf, type OngoingRide } from './ongoingRide.ts';

/** Le vélo attribué au départ permet de rendre le même vélo dans une autre station. */
export interface BikeRide extends OngoingRide { bikeId: string; }

export function bikeRideOf(raw: BikeRide): BikeRide {
  const ride = ongoingRideOf(raw);
  if (typeof raw.bikeId !== 'string' || raw.bikeId.trim() === '') throw new Error('a ride needs a bike');
  return { ...ride, startedAt: new Date(ride.startedAt), bikeId: raw.bikeId };
}

export function assertBikeReturn(ride: BikeRide, endedAt: Date): void {
  bikeRideOf(ride);
  if (!(endedAt instanceof Date) || Number.isNaN(endedAt.getTime())) throw new Error('a return has an invalid date');
  if (endedAt.getTime() < ride.startedAt.getTime()) throw new Error('a ride cannot end before it started');
}
