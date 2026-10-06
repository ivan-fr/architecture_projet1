import type { EventPublisher } from '../../../domain/ports/eventBus.ts';
import { publishStationBoundary } from '../../publishStationBoundary.ts';
import { Station } from '../../../domain/station.ts';
import { assertBikeReturn } from '../../../domain/bikeRide.ts';
import type { Clock } from '../../../domain/ports/clock.ts';
import type { BikeMovementRepository } from '../../../domain/ports/bikeMovementRepository.ts';
import type { ReturnBike } from './returnBike.command.ts';

interface Dependencies {
  movements: BikeMovementRepository;
  clock: Clock;
  events: EventPublisher;
}

/** Rendre un vélo : le vélo du trajet de l'usager occupe une borne, et le trajet se termine. */
export class ReturnBikeHandler {
  readonly #movements: BikeMovementRepository;
  readonly #clock: Clock;
  readonly #events: EventPublisher;

  constructor({ movements, clock, events }: Dependencies) {
    this.#movements = movements;
    this.#clock = clock;
    this.#events = events;
  }

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
    await publishStationBoundary(this.#events, before, station);
  }
}
