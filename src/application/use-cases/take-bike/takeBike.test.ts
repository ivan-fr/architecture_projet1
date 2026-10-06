import test from 'node:test';
import assert from 'node:assert/strict';

import { emailOf } from '../../../domain/email.ts';
import { Station } from '../../../domain/station.ts';
import type { User } from '../../../domain/user.ts';
import { inMemoryBikeMovementRepository } from '../../../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { inMemoryEventBus } from '../../../infrastructure/in-memory/inMemoryEventBus.ts';
import { inMemoryUserRepository } from '../../../infrastructure/in-memory/inMemoryUserRepository.ts';
import { TakeBikeHandler } from './takeBike.handler.ts';

const LINA: User = { id: 'u1', name: 'Lina', email: emailOf('lina@beaulieu.fr'), riderType: 'subscriber' };
const NOW = new Date('2026-10-03T08:15:00Z');
const clockAt = (now: Date) => ({ now: () => now });

/** Un service avec Lina inscrite, deux stations garnies, et une horloge qui dit toujours la même heure. */
function service() {
    const movements = inMemoryBikeMovementRepository([
        Station.of({ id: 'gare', docks: 20, bikes: ['b1', 'b2'] }),
        Station.of({ id: 'mairie', docks: 20, bikes: ['b3'] }),
    ]);
    const handlerAt = (now: Date) =>
        new TakeBikeHandler({ users: inMemoryUserRepository([LINA]), movements, clock: clockAt(now), events: inMemoryEventBus() });
    return { handler: handlerAt(NOW), handlerAt, movements };
}

//DEMANDE 06
test('un usager connu prend un vélo : le trajet démarre à l\'heure courante, depuis cette station', async () => {
    const { handler, movements } = service();

    await handler.handle({ userId: 'u1', stationId: 'gare' });

    assert.deepEqual(await movements.rideOfUser('u1'), { userId: 'u1', fromStationId: 'gare', startedAt: NOW, bikeId: 'b1' });
});

test('un usager inconnu est refusé, et rien n\'est enregistré', async () => {
    const { handler, movements } = service();

    await assert.rejects(() => handler.handle({ userId: 'inconnu', stationId: 'gare' }), /unknown user/);
    assert.equal(await movements.rideOfUser('inconnu'), undefined);
    assert.deepEqual((await movements.byStation('gare'))?.bikes, ['b1', 'b2']);
});

test('un usager déjà en trajet ne peut pas prendre un second vélo, et son trajet en cours ne change pas', async () => {
    const { handler, handlerAt, movements } = service();
    await handler.handle({ userId: 'u1', stationId: 'gare' });

    await assert.rejects(() => handlerAt(new Date('2026-10-03T09:00:00Z')).handle({ userId: 'u1', stationId: 'mairie' }), /already riding/);
    assert.deepEqual(await movements.rideOfUser('u1'), { userId: 'u1', fromStationId: 'gare', startedAt: NOW, bikeId: 'b1' });
    assert.deepEqual((await movements.byStation('mairie'))?.bikes, ['b3']);
});
