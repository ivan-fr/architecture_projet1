import type { StationFollow } from '../stationFollow.ts';

/** Le suivi se conserve ; le lecteur ne reçoit que les identifiants des destinataires. */
export interface StationFollowerRepository {
  follow(follow: StationFollow): Promise<void>;
  followersOf(stationId: string): Promise<ReadonlyArray<string>>;
}
