import { startRide } from '../../../domain/ongoingRide.ts';
import type { Clock } from '../../../domain/ports/clock.ts';
import type { OngoingRideRepository } from '../../../domain/ports/ongoingRideRepository.ts';
import type { UserRepository } from '../../../domain/ports/userRepository.ts';
import type { TakeBike } from './takeBike.command.ts';

interface Dependencies {
  users: UserRepository;
  rides: OngoingRideRepository;
  clock: Clock;
}

/** Prendre un vélo : l'ordre des opérations, et rien d'autre. Les règles sont dans le domaine. */
export class TakeBikeHandler {
  readonly #users: UserRepository;
  readonly #rides: OngoingRideRepository;
  readonly #clock: Clock;

  constructor({ users, rides, clock }: Dependencies) {
    this.#users = users;
    this.#rides = rides;
    this.#clock = clock;
  }

  async handle({ userId, stationId }: TakeBike): Promise<void> {
    const user = await this.#users.byId(userId);
    if (!user) throw new Error(`unknown user ${userId}`);

    const current = await this.#rides.ofUser(user.id);
    const ride = startRide({ userId: user.id, stationId, now: this.#clock.now(), current });

    // Le seul enregistrement, après toutes les vérifications : un refus n'a rien écrit.
    await this.#rides.save(ride);
  }
}
