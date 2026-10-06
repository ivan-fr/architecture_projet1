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
