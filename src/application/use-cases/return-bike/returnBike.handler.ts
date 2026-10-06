import { Station } from '../../../domain/station.ts';
import { assertBikeReturn } from '../../../domain/bikeRide.ts';
import type { Clock } from '../../../domain/ports/clock.ts';
import type { BikeMovementRepository } from '../../../domain/ports/bikeMovementRepository.ts';
import type { ReturnBike } from './returnBike.command.ts';

interface Dependencies { movements: BikeMovementRepository; clock: Clock; }

export class ReturnBikeHandler {
  readonly #movements: BikeMovementRepository;
  readonly #clock: Clock;
  constructor({ movements, clock }: Dependencies) { this.#movements = movements; this.#clock = clock; }

  async handle({ userId, stationId }: ReturnBike): Promise<void> {
    const ride = await this.#movements.rideOfUser(userId);
    if (!ride) throw new Error(`no active ride for ${userId}`);
    const endedAt = this.#clock.now();
    assertBikeReturn(ride, endedAt);
    const before = await this.#movements.byStation(stationId);
    if (!before) throw new Error(`unknown station ${stationId}`);
    const station = Station.of({ id: before.id, docks: before.docks, bikes: before.bikes, brokenBikes: before.brokenBikes });
    station.returnBike(ride.bikeId);
    await this.#movements.return(before, station, ride, endedAt);
  }
}
