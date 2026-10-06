import { stationFollowOf } from '../../../domain/stationFollow.ts';
import type { UserRepository } from '../../../domain/ports/userRepository.ts';
import type { StationRepository } from '../../../domain/ports/stationRepository.ts';
import type { StationFollowerRepository } from '../../../domain/ports/stationFollowerRepository.ts';
import type { FollowStation } from './followStation.command.ts';

interface Dependencies {
  users: UserRepository;
  stations: Pick<StationRepository, 'byId'>;
  followers: StationFollowerRepository;
}

/** Valide le choix avant l'unique écriture ; suivre à nouveau est sans effet supplémentaire. */
export class FollowStationHandler {
  readonly #users: UserRepository;
  readonly #stations: Pick<StationRepository, 'byId'>;
  readonly #followers: StationFollowerRepository;

  constructor({ users, stations, followers }: Dependencies) {
    this.#users = users;
    this.#stations = stations;
    this.#followers = followers;
  }

  async handle(command: FollowStation): Promise<void> {
    const follow = stationFollowOf(command);
    if (!await this.#users.byId(follow.userId)) throw new Error(`unknown user ${follow.userId}`);
    if (!await this.#stations.byId(follow.stationId)) throw new Error(`unknown station ${follow.stationId}`);
    await this.#followers.follow(follow);
  }
}
