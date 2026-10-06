import { Station } from '../domain/station.ts';
import { emailOf } from '../domain/email.ts';
import { userOf } from '../domain/user.ts';
import type { OngoingRide } from '../domain/ongoingRide.ts';
import type { Mailer, Letter } from '../domain/ports/mailer.ts';
import type { AppNotifier } from '../domain/ports/appNotifier.ts';
import { inMemoryUserRepository } from '../infrastructure/in-memory/inMemoryUserRepository.ts';
import { inMemoryBikeMovementRepository } from '../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { inMemoryOngoingRideRepository } from '../infrastructure/in-memory/inMemoryOngoingRideRepository.ts';
import { inMemoryStationFollowerRepository } from '../infrastructure/in-memory/inMemoryStationFollowerRepository.ts';
import { inMemoryAppNotifier } from '../infrastructure/in-memory/inMemoryAppNotifier.ts';
import { inMemoryEventBus } from '../infrastructure/in-memory/inMemoryEventBus.ts';
import { TakeBikeHandler } from '../application/use-cases/take-bike/takeBike.handler.ts';
import { ReturnBikeHandler } from '../application/use-cases/return-bike/returnBike.handler.ts';
import { FollowStationHandler } from '../application/use-cases/follow-station/followStation.handler.ts';
import { regulationMail } from '../application/listeners/regulationMail.ts';
import { stationFollowersApp } from '../application/listeners/stationFollowersApp.ts';

/** Trois usagers, deux stations, les deux canaux ; les tests nomment seulement leur variation. */
export function followedStationService(options: { count?: number; docks?: number; mailer?: Mailer; notifier?: AppNotifier } = {}) {
  const records = new Map<string, OngoingRide>();
  const movements = inMemoryBikeMovementRepository([
    Station.of({ id: 'gare', docks: options.docks ?? 2, bikes: Array.from({ length: options.count ?? 1 }, (_, index) => `b${index + 1}`) }),
    Station.of({ id: 'mairie', docks: 1 }),
  ], records);
  const users = inMemoryUserRepository(['u1', 'u2', 'u3'].map((id) => userOf({ id, name: id, email: `${id}@beaulieu.fr`, riderType: 'subscriber' })));
  const followers = inMemoryStationFollowerRepository(), app = inMemoryAppNotifier(), events = inMemoryEventBus();
  const letters: Letter[] = [];
  const clock = { now: () => new Date('2026-10-06T08:00:00Z') };
  regulationMail(events, options.mailer ?? { send: async (letter) => { letters.push(letter); } }, [emailOf('regulation@beaulieu.fr')]);
  const stopApp = stationFollowersApp(events, followers, options.notifier ?? app);
  return {
    followers, app, events, letters, movements, stopApp, rides: inMemoryOngoingRideRepository(records),
    follow: new FollowStationHandler({ users, stations: { byId: (id) => movements.byStation(id) }, followers }),
    take: new TakeBikeHandler({ users, movements, clock, events }),
    back: new ReturnBikeHandler({ movements, clock, events }),
  };
}
