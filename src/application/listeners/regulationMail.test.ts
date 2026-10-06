import test from 'node:test';
import assert from 'node:assert/strict';
import { regulationService } from '../../testing/regulationService.ts';

//DEMANDE 14
test('le dernier vélo pris envoie un mail à la régulation', async () => {
    const { take, letters, rides, movements } = regulationService();
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.equal(letters.length, 1);
    assert.equal(letters[0]?.to, 'regulation@beaulieu.fr');
    assert.match(letters[0]?.subject ?? '', /gare vide/);
    assert.ok(await rides.ofUser('u1'));
    assert.deepEqual((await movements.byStation('gare'))?.bikes, []);
});

test('la dernière borne occupée envoie un mail de station pleine', async () => {
    const { take, back, letters } = regulationService({ count: 2, docks: 3 });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'mairie' });
    assert.equal(letters.length, 1);
    assert.match(letters[0]?.subject ?? '', /mairie pleine/);
});

test('une station ni vide ni pleine ne déclenche rien', async () => {
    const { take, back, letters } = regulationService({ count: 2, docks: 3 });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(letters, []);
});

test('si le mail échoue, le trajet et le mouvement restent enregistrés', async () => {
    const { take, rides, movements, events } = regulationService({ mailer: { send: async () => { throw new Error('mail offline'); } } });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.ok(await rides.ofUser('u1'));
    assert.deepEqual((await movements.byStation('gare'))?.bikes, []);
    assert.equal(events.failures.length, 1);
});

test('un retour refusé n’envoie aucun mail et conserve le trajet', async () => {
    const { take, back, letters, rides } = regulationService({ count: 2, docks: 3, destinationBikes: ['b9'] });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await assert.rejects(() => back.handle({ userId: 'u1', stationId: 'mairie' }), /full/);
    assert.deepEqual(letters, []);
    assert.ok(await rides.ofUser('u1'));
});
