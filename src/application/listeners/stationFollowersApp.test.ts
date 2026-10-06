import test from 'node:test';
import assert from 'node:assert/strict';
import { followedStationService } from '../../testing/followedStationService.ts';

//DEMANDE 15
test('station vide : l’appli s’ajoute au mail et prévient seulement les suiveurs de cette station', async () => {
    const { follow, take, app, letters } = followedStationService();
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await follow.handle({ userId: 'u2', stationId: 'mairie' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(app.notifications, [{ userId: 'u1', stationId: 'gare', type: 'StationEmpty' }]);
    assert.equal(letters.length, 1);
    assert.match(letters[0]?.subject ?? '', /gare vide/);
});

test('station pleine : le même auditeur prévient ses suiveurs et conserve le mail', async () => {
    const { follow, take, back, app, letters } = followedStationService({ count: 2, docks: 3 });
    await follow.handle({ userId: 'u2', stationId: 'mairie' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'mairie' });
    assert.deepEqual(app.notifications, [{ userId: 'u2', stationId: 'mairie', type: 'StationFull' }]);
    assert.equal(letters.length, 1);
    assert.match(letters[0]?.subject ?? '', /mairie pleine/);
});

test('sans suivi, aucun usager n’est prévenu et le mail continue', async () => {
    const { take, app, letters } = followedStationService();
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(app.notifications, []);
    assert.equal(letters.length, 1);
});

test('suivre deux fois n’envoie pas deux notifications', async () => {
    const { follow, take, app } = followedStationService();
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.equal(app.notifications.length, 1);
});

test('une station intermédiaire ne déclenche aucun des deux canaux', async () => {
    const { follow, take, back, app, letters } = followedStationService({ count: 2, docks: 3 });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(app.notifications, []);
    assert.deepEqual(letters, []);
});

test('l’auditeur peut être débranché sans débrancher le mail', async () => {
    const { follow, take, stopApp, app, letters } = followedStationService();
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    stopApp();
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(app.notifications, []);
    assert.equal(letters.length, 1);
});

import { inMemoryEventBus } from '../../infrastructure/in-memory/inMemoryEventBus.ts';
import { inMemoryAppNotifier } from '../../infrastructure/in-memory/inMemoryAppNotifier.ts';
import { emailOf } from '../../domain/email.ts';
import { regulationMail } from './regulationMail.ts';
import { stationFollowersApp } from './stationFollowersApp.ts';

test('une notification en échec conserve le mail et le trajet enregistré', async () => {
    const { follow, take, letters, events, rides } = followedStationService({ notifier: { send: async () => { throw new Error('app offline'); } } });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.equal(letters.length, 1);
    assert.ok(await rides.ofUser('u1'));
    assert.equal(events.failures.length, 1);
});

test('une panne du mail n’empêche pas la notification appli', async () => {
    const { follow, take, app, events } = followedStationService({ mailer: { send: async () => { throw new Error('mail offline'); } } });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.equal(app.notifications.length, 1);
    assert.equal(events.failures.length, 1);
});

test('une erreur synchrone pour un usager ne prive pas le suivant de sa notification', async () => {
    const attempted: string[] = [];
    const { follow, take, letters, events } = followedStationService({ notifier: { send: (notification) => { attempted.push(notification.userId); if (notification.userId === 'u1') throw new Error('offline'); return Promise.resolve(); } } });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await follow.handle({ userId: 'u2', stationId: 'gare' });
    await take.handle({ userId: 'u3', stationId: 'gare' });
    assert.deepEqual(attempted, ['u1', 'u2']);
    assert.equal(letters.length, 1);
    assert.equal(events.failures.length, 1);
});

test('même un repository de suiveurs en panne ne bloque pas l’auditeur mail suivant', async () => {
    const events = inMemoryEventBus(), letters: string[] = [];
    const followers = { follow: async () => {}, followersOf: async (): Promise<string[]> => { throw new Error('followers offline'); } };
    stationFollowersApp(events, followers, inMemoryAppNotifier());
    regulationMail(events, { send: async (letter) => { letters.push(letter.subject); } }, [emailOf('regulation@beaulieu.fr')]);
    await events.publish({ type: 'StationFull', stationId: 'gare' });
    assert.deepEqual(letters, ['Station gare pleine']);
    assert.equal(events.failures.length, 1);
});

test('une prise refusée ne déclenche aucun canal', async () => {
    const { follow, take, letters, app, rides } = followedStationService({ count: 0 });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await assert.rejects(() => take.handle({ userId: 'u1', stationId: 'gare' }), /empty/);
    assert.deepEqual(letters, []);
    assert.deepEqual(app.notifications, []);
    assert.equal(await rides.ofUser('u1'), undefined);
});

test('la notification ne transporte ni nom, ni adresse, ni détail du trajet', async () => {
    const { follow, take, app } = followedStationService();
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    assert.deepEqual(Reflect.ownKeys(app.notifications[0]!).sort(), ['stationId', 'type', 'userId']);
});
