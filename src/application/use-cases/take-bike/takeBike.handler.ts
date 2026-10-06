import type { BikeMovementRepository } from '../../../domain/ports/bikeMovementRepository.ts';
import type { EventPublisher } from '../../../domain/ports/eventBus.ts';
import { publishStationBoundary } from '../../publishStationBoundary.ts';
import { Station } from '../../../domain/station.ts';
import { startRide } from '../../../domain/ongoingRide.ts';
import type { Clock } from '../../../domain/ports/clock.ts';
import type { UserRepository } from '../../../domain/ports/userRepository.ts';
import type { TakeBike } from './takeBike.command.ts';

/** Toutes obligatoires : un départ sans station ou sans annonce n'est pas un départ « allégé », c'est une erreur de branchement. */
interface Dependencies {
  users: UserRepository;
  movements: BikeMovementRepository;
  clock: Clock;
  events: EventPublisher;
}

/** Prendre un vélo : l'ordre des opérations, et rien d'autre. Les règles sont dans le domaine. */
export class TakeBikeHandler {
  readonly #users: UserRepository;
  readonly #movements: BikeMovementRepository;
  readonly #clock: Clock;
  readonly #events: EventPublisher;

  constructor({ users, movements, clock, events }: Dependencies) {
    this.#users = users;
    this.#movements = movements;
    this.#clock = clock;
    this.#events = events;
  }

  async handle({ userId, stationId }: TakeBike): Promise<void> {
    const user = await this.#users.byId(userId);
    if (!user) throw new Error(`unknown user ${userId}`);

    const current = await this.#movements.rideOfUser(user.id);
    const ride = startRide({ userId: user.id, stationId, now: this.#clock.now(), current });

    const before = await this.#movements.byStation(stationId);
    if (!before) throw new Error(`unknown station ${stationId}`);
    const station = Station.of({ id: before.id, docks: before.docks, bikes: before.bikes, brokenBikes: before.brokenBikes });
    const bikeId = station.takeBike();

    // Le seul enregistrement, après toutes les vérifications : le vélo retiré et le trajet, ensemble.
    await this.#movements.take(before, station, { ...ride, bikeId });
    await publishStationBoundary(this.#events, before, station);
  }
}
