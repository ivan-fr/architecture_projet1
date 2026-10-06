import type { EventSubscriptions } from '../../domain/ports/eventBus.ts';
import type { StationFollowerRepository } from '../../domain/ports/stationFollowerRepository.ts';
import type { AppNotifier } from '../../domain/ports/appNotifier.ts';

/** Un second auditeur du même fait : aucune branche supplémentaire dans le départ ou le retour. */
export function stationFollowersApp(events: EventSubscriptions, followers: StationFollowerRepository, notifier: AppNotifier): () => void {
  return events.subscribe(async (event) => {
    const recipients = [...new Set(await followers.followersOf(event.stationId))];
    const results = await Promise.allSettled(recipients.map(async (userId) => {
      await notifier.send({ userId, stationId: event.stationId, type: event.type });
    }));
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'station app notification delivery failed');
  });
}
