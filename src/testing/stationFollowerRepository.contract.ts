import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import type { StationFollowerRepository } from '../domain/ports/stationFollowerRepository.ts';

export function stationFollowerRepositoryContract(name: string, make: (t: TestContext) => Promise<StationFollowerRepository>): void {
    test(`${name} : une station sans suivi a une liste vide`, async (t) => {
        const followers = await make(t);
        assert.deepEqual(await followers.followersOf('gare'), []);
    });

    test(`${name} : seuls les suiveurs de la station sont retrouvés`, async (t) => {
        const followers = await make(t);
        await followers.follow({ userId: 'u1', stationId: 'gare' });
        await followers.follow({ userId: 'u2', stationId: 'mairie' });
        assert.deepEqual(await followers.followersOf('gare'), ['u1']);
        assert.deepEqual(await followers.followersOf('mairie'), ['u2']);
    });

    test(`${name} : suivre deux fois ne crée pas un second destinataire`, async (t) => {
        const followers = await make(t);
        await followers.follow({ userId: 'u1', stationId: 'gare' });
        await followers.follow({ userId: 'u1', stationId: 'gare' });
        assert.deepEqual(await followers.followersOf('gare'), ['u1']);
    });

    test(`${name} : modifier une liste relue ne modifie pas le stockage`, async (t) => {
        const followers = await make(t);
        await followers.follow({ userId: 'u1', stationId: 'gare' });
        const copy = await followers.followersOf('gare');
        (copy as string[]).push('u2');
        assert.deepEqual(await followers.followersOf('gare'), ['u1']);
    });

    test(`${name} : un suivi invalide est refusé avant écriture`, async (t) => {
        const followers = await make(t);
        await assert.rejects(() => followers.follow({ userId: '', stationId: 'gare' }), /user/);
        await assert.rejects(() => followers.follow({ userId: 'u1', stationId: ' ' }), /station/);
        assert.deepEqual(await followers.followersOf('gare'), []);
    });
}
