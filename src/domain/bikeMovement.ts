import { Station } from './station.ts';
import { bikeRideOf, assertBikeReturn, type BikeRide } from './bikeRide.ts';

function reconstructed(station: Station): Station {
  return Station.of({ id: station.id, docks: station.docks, bikes: station.bikes, brokenBikes: station.brokenBikes });
}

function assertResult(expected: Station, after: Station): void {
  if (expected.id !== after.id || expected.docks !== after.docks ||
      JSON.stringify(expected.bikes) !== JSON.stringify(after.bikes) ||
      JSON.stringify(expected.brokenBikes) !== JSON.stringify(after.brokenBikes)) throw new Error('invalid station movement');
}

/** Même une écriture directe doit déplacer le vélo réel en respectant Station. */
export function assertBikeDeparture(before: Station, after: Station, raw: BikeRide): void {
  const ride = bikeRideOf(raw);
  if (ride.fromStationId !== before.id) throw new Error('the ride starts at another station');
  const expected = reconstructed(before);
  if (expected.takeBike() !== ride.bikeId) throw new Error('the ride has another bike');
  assertResult(expected, after);
}

export function assertBikeArrival(before: Station, after: Station, ride: BikeRide, endedAt: Date): void {
  assertBikeReturn(ride, endedAt);
  const expected = reconstructed(before);
  expected.returnBike(ride.bikeId);
  assertResult(expected, after);
}
