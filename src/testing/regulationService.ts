import { Station } from '../domain/station.ts';
import { emailOf } from '../domain/email.ts';
import { aUser } from './builders.ts';
import type { OngoingRide } from '../domain/ongoingRide.ts';
import type { Letter, Mailer } from '../domain/ports/mailer.ts';
import { inMemoryUserRepository } from '../infrastructure/in-memory/inMemoryUserRepository.ts';
import { inMemoryOngoingRideRepository } from '../infrastructure/in-memory/inMemoryOngoingRideRepository.ts';
import { inMemoryBikeMovementRepository } from '../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { inMemoryEventBus } from '../infrastructure/in-memory/inMemoryEventBus.ts';
import { TakeBikeHandler } from '../application/use-cases/take-bike/takeBike.handler.ts';
import { ReturnBikeHandler } from '../application/use-cases/return-bike/returnBike.handler.ts';
import { regulationMail } from '../application/listeners/regulationMail.ts';

/** Scénario US14 : aucun vrai mail, une horloge fixe, deux stations. */
export function regulationService(options: { count?: number; docks?: number; destinationBikes?: string[]; mailer?: Mailer } = {}) {
  const records = new Map<string, OngoingRide>();
  const movements = inMemoryBikeMovementRepository([
    Station.of({ id: 'gare', docks: options.docks ?? 2, bikes: Array.from({ length: options.count ?? 1 }, (_, index) => `b${index + 1}`) }),
    Station.of({ id: 'mairie', docks: 1, bikes: options.destinationBikes ?? [] }),
  ], records);
  const rides = inMemoryOngoingRideRepository(records);
  const users = inMemoryUserRepository([aUser().build()]);
  const clock = { now: () => new Date('2026-10-06T08:00:00Z') };
  const events = inMemoryEventBus();
  const letters: Letter[] = [];
  regulationMail(events, options.mailer ?? { send: async (letter) => { letters.push(letter); } }, [emailOf('regulation@beaulieu.fr')]);
  return { movements, rides, events, letters, take: new TakeBikeHandler({ users, clock, movements, events }), back: new ReturnBikeHandler({ movements, clock, events }) };
}
