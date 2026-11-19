import test from 'node:test';
import assert from 'node:assert/strict';

import { inMemoryBikeMovementRepository } from '../../../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { inMemoryEventBus } from '../../../infrastructure/in-memory/inMemoryEventBus.ts';
import { aStation } from '../../../testing/builders.ts';
import { ReturnBikeHandler } from './returnBike.handler.ts';

const NOW = new Date('2026-10-06T08:00:00Z');

/** Lina roule avec le vélo x99 et le rend à la gare, une station de 20 bornes qui a déjà `bikes` vélos. */
function returningToAStationWith(bikes: number) {
    const ride = { userId: 'u1', fromStationId: 'mairie', startedAt: NOW, bikeId: 'x99' };
    const movements = inMemoryBikeMovementRepository([aStation().withDocks(20).withBikes(bikes).build()], new Map([['u1', ride]]));
    const handler = new ReturnBikeHandler({ movements, clock: { now: () => NOW }, events: inMemoryEventBus() });
    return { movements, giveBack: () => handler.handle({ userId: 'u1', stationId: 'gare' }) };
}

//DEMANDE 18 : la borne, par le cas d'usage « rendre un vélo »
test('20 vélos pour 20 bornes : la borne refuse le vélo, et la station ne change pas', async () => {
    const { movements, giveBack } = returningToAStationWith(20);

    await assert.rejects(giveBack, /station gare is full/);
    assert.equal((await movements.byStation('gare'))?.bikes.length, 20);
});

test('19 vélos : la borne accepte le vélo, et la station est pleine', async () => {
    const { movements, giveBack } = returningToAStationWith(19);

    await giveBack();

    assert.equal((await movements.byStation('gare'))?.freeDocks, 0);
});
