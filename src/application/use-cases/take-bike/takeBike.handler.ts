import type { BikeMovementRepository } from '../../../domain/ports/bikeMovementRepository.ts';
import type { EventPublisher } from '../../../domain/ports/eventBus.ts';
import { publishStationBoundary } from '../../publishStationBoundary.ts';
import { Station } from '../../../domain/station.ts';
import { startRide } from '../../../domain/ongoingRide.ts';
import type { Clock } from '../../../domain/ports/clock.ts';
import type { OngoingRideRepository } from '../../../domain/ports/ongoingRideRepository.ts';
import type { UserRepository } from '../../../domain/ports/userRepository.ts';
import type { TakeBike } from './takeBike.command.ts';

interface Dependencies {
  users: UserRepository;
  rides: OngoingRideRepository;
  clock: Clock;
  movements?: BikeMovementRepository;
  events?: EventPublisher;
}

/** Prendre un vélo : l'ordre des opérations, et rien d'autre. Les règles sont dans le domaine. */
export class TakeBikeHandler {
  readonly #users: UserRepository;
  readonly #rides: OngoingRideRepository;
  readonly #clock: Clock;
  readonly #events: EventPublisher | undefined;
  readonly #movements: BikeMovementRepository | undefined;

  constructor({ users, rides, clock, movements, events }: Dependencies) {
    this.#users = users;
    this.#rides = rides;
    this.#clock = clock;
    this.#events = events;
    this.#movements = movements;
  }

  async handle({ userId, stationId }: TakeBike): Promise<void> {
    const user = await this.#users.byId(userId);
    if (!user) throw new Error(`unknown user ${userId}`);

    const current = await this.#rides.ofUser(user.id);
    const ride = startRide({ userId: user.id, stationId, now: this.#clock.now(), current });

    if (this.#movements) {
      const before = await this.#movements.byStation(stationId);
      if (!before) throw new Error(`unknown station ${stationId}`);
      const station = Station.of({ id: before.id, docks: before.docks, bikes: before.bikes, brokenBikes: before.brokenBikes });
      const bikeId = station.takeBike();
      await this.#movements.take(before, station, { ...ride, bikeId });
      await publishStationBoundary(this.#events, before, station);
      return;
    }

    // Le seul enregistrement, après toutes les vérifications : un refus n'a rien écrit.
    await this.#rides.save(ride);
  }
}
