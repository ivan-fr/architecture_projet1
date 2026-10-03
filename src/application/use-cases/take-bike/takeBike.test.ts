import test from 'node:test';
import assert from 'node:assert/strict';

import type { User } from '../../../domain/user.ts';
import { inMemoryOngoingRideRepository } from '../../../infrastructure/in-memory/inMemoryOngoingRideRepository.ts';
import { inMemoryUserRepository } from '../../../infrastructure/in-memory/inMemoryUserRepository.ts';
import { TakeBikeHandler } from './takeBike.handler.ts';

const LINA: User = { id: 'u1', name: 'Lina', riderType: 'subscriber' };
const NOW = new Date('2026-10-03T08:15:00Z');
const clockAt = (now: Date) => ({ now: () => now });

/** Un service avec Lina inscrite, et une horloge qui dit toujours la même heure. */
function service() {
    const rides = inMemoryOngoingRideRepository();
    const handler = new TakeBikeHandler({ users: inMemoryUserRepository([LINA]), rides, clock: clockAt(NOW) });
    return { handler, rides };
}

//DEMANDE 06
test('un usager connu prend un vélo : le trajet démarre à l\'heure courante, depuis cette station', async () => {
    const { handler, rides } = service();

    await handler.handle({ userId: 'u1', stationId: 'gare' });

    assert.deepEqual(await rides.ofUser('u1'), { userId: 'u1', fromStationId: 'gare', startedAt: NOW });
});

test('un usager inconnu est refusé, et rien n\'est enregistré', async () => {
    const { handler, rides } = service();

    await assert.rejects(() => handler.handle({ userId: 'inconnu', stationId: 'gare' }), /unknown user/);
    assert.equal(await rides.ofUser('inconnu'), undefined);
});

test('un usager déjà en trajet ne peut pas prendre un second vélo, et son trajet en cours ne change pas', async () => {
    const { handler, rides } = service();
    await handler.handle({ userId: 'u1', stationId: 'gare' });
    const later = new TakeBikeHandler({ users: inMemoryUserRepository([LINA]), rides, clock: clockAt(new Date('2026-10-03T09:00:00Z')) });

    await assert.rejects(() => later.handle({ userId: 'u1', stationId: 'mairie' }), /already riding/);
    assert.deepEqual(await rides.ofUser('u1'), { userId: 'u1', fromStationId: 'gare', startedAt: NOW });
});
