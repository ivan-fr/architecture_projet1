import test from 'node:test';
import assert from 'node:assert/strict';
import { phoneNumberOf } from '../../domain/phoneNumber.ts';
import { followedStationService } from '../../testing/followedStationService.ts';

const agentNumber = phoneNumberOf('+33 6 12 34 56 78');

test('la station vide prévient par SMS les agents qui ont fourni un numéro, en plus des canaux existants', async () => {
    const { follow, take, letters, app, sms, movements } = followedStationService({
        agents: [{ phoneNumber: agentNumber }, { phoneNumber: agentNumber }, {}],
    });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });

    assert.deepEqual(sms.messages, [{
        to: agentNumber,
        body: 'La station gare est devenue vide. Une intervention de régulation est nécessaire.',
    }]);
    assert.equal(letters.length, 1);
    assert.deepEqual(app.notifications, [{ userId: 'u1', stationId: 'gare', type: 'StationEmpty' }]);
    assert.deepEqual((await movements.byStation('gare'))?.bikes, []);
});

test('la station pleine déclenche aussi le SMS et les canaux précédents', async () => {
    const { take, back, letters, app, sms } = followedStationService({
        count: 2,
        docks: 3,
        agents: [{ phoneNumber: agentNumber }],
    });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'mairie' });

    assert.match(sms.messages[0]?.body ?? '', /station mairie est devenue pleine/);
    assert.equal(sms.messages.length, 1);
    assert.equal(letters.length, 1);
    assert.deepEqual(app.notifications, []);
});

test('sans numéro, aucun SMS n’est envoyé et une station intermédiaire ne notifie personne', async () => {
    const { take, back, letters, app, sms } = followedStationService({ count: 2, docks: 3, agents: [{}] });
    await take.handle({ userId: 'u1', stationId: 'gare' });
    await back.handle({ userId: 'u1', stationId: 'gare' });

    assert.deepEqual(sms.messages, []);
    assert.deepEqual(letters, []);
    assert.deepEqual(app.notifications, []);
});

test('une panne SMS ne bloque ni le mail, ni l’appli, ni l’enregistrement du trajet', async () => {
    const { follow, take, letters, app, events, rides } = followedStationService({
        agents: [{ phoneNumber: agentNumber }],
        smsSender: { send: async () => { throw new Error('SMS offline'); } },
    });
    await follow.handle({ userId: 'u1', stationId: 'gare' });
    await take.handle({ userId: 'u1', stationId: 'gare' });

    assert.equal(letters.length, 1);
    assert.equal(app.notifications.length, 1);
    assert.ok(await rides.ofUser('u1'));
    assert.equal(events.failures.length, 1);
});

test('un échec pour un agent ne prive pas les autres agents de leur SMS', async () => {
    const attempted: string[] = [];
    const { take, events } = followedStationService({
        agents: [{ phoneNumber: agentNumber }, { phoneNumber: phoneNumberOf('+33 6 98 76 54 32') }],
        smsSender: { send: (message) => {
            attempted.push(message.to);
            if (message.to === agentNumber) throw new Error('SMS offline');
            return Promise.resolve();
        } },
    });
    await take.handle({ userId: 'u1', stationId: 'gare' });

    assert.deepEqual(attempted, [agentNumber, '+33 6 98 76 54 32']);
    assert.equal(events.failures.length, 1);
});
