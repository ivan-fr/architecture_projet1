import test from 'node:test';
import assert from 'node:assert/strict';

import { Station } from '../domain/station.ts';
import { publishStationBoundary } from './publishStationBoundary.ts';

const LAST_BIKE_TAKEN = [Station.of({ id: 'gare', docks: 2, bikes: ['b1'] }), Station.of({ id: 'gare', docks: 2 })] as const;

//DEMANDE 14 : une panne de publication ne fait pas échouer le mouvement, mais elle ne disparaît pas
test('une publication qui échoue est signalée, sans faire échouer le mouvement déjà enregistré', async () => {
    const reported: unknown[] = [];
    const brokenBus = {
        async publish() {
            throw new Error('bus unreachable');
        },
    };

    await publishStationBoundary(brokenBus, ...LAST_BIKE_TAKEN, (error) => reported.push(error));

    assert.equal(reported.length, 1);
    assert.match(String(reported[0]), /bus unreachable/);
});

test('sans transition, rien n\'est publié ni signalé', async () => {
    const published: unknown[] = [];
    const station = Station.of({ id: 'gare', docks: 3, bikes: ['b1', 'b2'] });

    await publishStationBoundary({ async publish(event) { published.push(event); } }, station, station, () => assert.fail('nothing to report'));

    assert.deepEqual(published, []);
});
