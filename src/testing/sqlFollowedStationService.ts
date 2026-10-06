import type { DatabaseSync } from 'node:sqlite';
import { Station } from '../domain/station.ts';
import { emailOf } from '../domain/email.ts';
import { aUser } from './builders.ts';
import type { Letter } from '../domain/ports/mailer.ts';
import { sqlStationRepository } from '../infrastructure/persistence/sqlite/sqlStationRepository.ts';
import { sqlUserRepository } from '../infrastructure/persistence/sqlite/sqlUserRepository.ts';
import { sqlStationFollowerRepository } from '../infrastructure/persistence/sqlite/sqlStationFollowerRepository.ts';
import { sqlBikeMovementRepository } from '../infrastructure/persistence/sqlite/sqlBikeMovementRepository.ts';
import { sqlOngoingRideRepository } from '../infrastructure/persistence/sqlite/sqlOngoingRideRepository.ts';
import { inMemoryEventBus } from '../infrastructure/in-memory/inMemoryEventBus.ts';
import { inMemoryAppNotifier } from '../infrastructure/in-memory/inMemoryAppNotifier.ts';
import { TakeBikeHandler } from '../application/use-cases/take-bike/takeBike.handler.ts';
import { ReturnBikeHandler } from '../application/use-cases/return-bike/returnBike.handler.ts';
import { FollowStationHandler } from '../application/use-cases/follow-station/followStation.handler.ts';
import { stationFollowersApp } from '../application/listeners/stationFollowersApp.ts';
import { regulationMail } from '../application/listeners/regulationMail.ts';

export async function seedFollowedStations(database: DatabaseSync): Promise<void> {
  const users = sqlUserRepository(database), stations = sqlStationRepository(database);
  for (const id of ['u1', 'u2', 'u3']) await users.add(aUser().withId(id).named(id).build());
  await stations.save(Station.of({ id: 'gare', docks: 1, bikes: ['b1'] }));
  await stations.save(Station.of({ id: 'mairie', docks: 1 }));
}

/** Réutilise les mêmes handlers et auditeurs avec les ports SQL sur une seule connexion. */
export function sqlFollowedStationService(database: DatabaseSync) {
  const users = sqlUserRepository(database), stations = sqlStationRepository(database), followers = sqlStationFollowerRepository(database);
  const movements = sqlBikeMovementRepository(database), events = inMemoryEventBus(), app = inMemoryAppNotifier();
  const letters: Letter[] = [], clock = { now: () => new Date('2026-10-06T08:00:00Z') };
  regulationMail(events, { send: async (letter) => { letters.push(letter); } }, [emailOf('regulation@beaulieu.fr')]);
  stationFollowersApp(events, followers, app);
  return {
    letters, app, events, followers, movements, rides: sqlOngoingRideRepository(database),
    follow: new FollowStationHandler({ users, stations, followers }),
    take: new TakeBikeHandler({ users, movements, clock, events }),
    back: new ReturnBikeHandler({ movements, clock, events }),
  };
}
