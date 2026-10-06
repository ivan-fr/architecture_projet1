import test from 'node:test';
import assert from 'node:assert/strict';

import { Station } from '../../../domain/station.ts';
import { userOf } from '../../../domain/user.ts';
import { inMemoryBikeMovementRepository } from '../../../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { inMemoryEventBus } from '../../../infrastructure/in-memory/inMemoryEventBus.ts';
import { inMemoryUserRepository } from '../../../infrastructure/in-memory/inMemoryUserRepository.ts';
import { ReturnBikeHandler } from './returnBike.handler.ts';

test('20/20 : une station pleine refuse le retour d’un vélo', async () => {
    const now = new Date('2026-10-06T08:00:00Z');

    // important : le vélo du trajet n'est PAS déjà dans la station
    const bikeId = 'x99';

    const records = new Map([
        ['u1', { userId: 'u1', fromStationId: 'gare', startedAt: now, bikeId }],
    ]);

    const movements = inMemoryBikeMovementRepository([
        Station.of({ id: 'gare', docks: 20, bikes: Array.from({ length: 20 }, (_, i) => `b${i + 1}`) }),
    ], records);

    const users = inMemoryUserRepository([
        userOf({ id: 'u1', name: 'u1', email: 'u1@beaulieu.fr', riderType: 'subscriber' }),
    ]);

    const handler = new ReturnBikeHandler({
        movements,
        clock: { now: () => now },
        events: inMemoryEventBus(),
    });

    await assert.rejects(
        () => handler.handle({ userId: 'u1', stationId: 'gare' }),
        /station gare is full/,
    );
});

test('19/20 : une place libre permet le retour', async () => {
    const now = new Date('2026-10-06T08:00:00Z');
    const bikeId = 'x99';

    const records = new Map([
        ['u1', { userId: 'u1', fromStationId: 'gare', startedAt: now, bikeId }],
    ]);

    const movements = inMemoryBikeMovementRepository([
        Station.of({ id: 'gare', docks: 20, bikes: Array.from({ length: 19 }, (_, i) => `b${i + 1}`) }),
    ], records);

    const users = inMemoryUserRepository([
        userOf({ id: 'u1', name: 'u1', email: 'u1@beaulieu.fr', riderType: 'subscriber' }),
    ]);

    const handler = new ReturnBikeHandler({
        movements,
        clock: { now: () => now },
        events: inMemoryEventBus(),
    });

    await handler.handle({ userId: 'u1', stationId: 'gare' });

    const station = await movements.byStation('gare');
    assert.equal(station?.bikes.length, 20);
});