import { stationFollowOf } from '../../domain/stationFollow.ts';
import type { StationFollowerRepository } from '../../domain/ports/stationFollowerRepository.ts';

export function inMemoryStationFollowerRepository(): StationFollowerRepository {
  const followers = new Map<string, Set<string>>();
  return {
    async follow(raw) {
      const { userId, stationId } = stationFollowOf(raw);
      const users = followers.get(stationId) ?? new Set<string>();
      users.add(userId);
      followers.set(stationId, users);
    },
    async followersOf(stationId) { return [...(followers.get(stationId) ?? [])]; },
  };
}
