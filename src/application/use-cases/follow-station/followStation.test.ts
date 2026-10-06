import test from 'node:test';
import assert from 'node:assert/strict';
import { Station } from '../../../domain/station.ts';
import { userOf } from '../../../domain/user.ts';
import { inMemoryUserRepository } from '../../../infrastructure/in-memory/inMemoryUserRepository.ts';
import { inMemoryStationFollowerRepository } from '../../../infrastructure/in-memory/inMemoryStationFollowerRepository.ts';
import { FollowStationHandler } from './followStation.handler.ts';

function service() {
    const users = inMemoryUserRepository([userOf({ id: 'u1', name: 'Lina', email: 'lina@beaulieu.fr', riderType: 'subscriber' })]);
    const followers = inMemoryStationFollowerRepository();
    const stations = { byId: async (id: string) => id === 'gare' ? Station.of({ id, docks: 2 }) : undefined };
    return { followers, handler: new FollowStationHandler({ users, stations, followers }) };
}

test('un usager connu suit une station connue une seule fois', async () => {
    const { handler, followers } = service();
    await handler.handle({ userId: 'u1', stationId: 'gare' });
    await handler.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(await followers.followersOf('gare'), ['u1']);
});

test('un usager inconnu ne crée aucun suivi', async () => {
    const { handler, followers } = service();
    await assert.rejects(() => handler.handle({ userId: 'unknown', stationId: 'gare' }), /unknown user/);
    assert.deepEqual(await followers.followersOf('gare'), []);
});

test('une station inconnue ne crée aucun suivi', async () => {
    const { handler, followers } = service();
    await assert.rejects(() => handler.handle({ userId: 'u1', stationId: 'unknown' }), /unknown station/);
    assert.deepEqual(await followers.followersOf('unknown'), []);
    assert.deepEqual(await followers.followersOf('gare'), []);
});

test('un identifiant vide est refusé avant écriture', async () => {
    const { handler, followers } = service();
    await assert.rejects(() => handler.handle({ userId: 'u1', stationId: ' ' }), /station/);
    assert.deepEqual(await followers.followersOf('gare'), []);
});
