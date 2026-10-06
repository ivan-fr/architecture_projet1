import test from 'node:test';
import assert from 'node:assert/strict';

import { Station } from '../../domain/station.ts';
import { operatorStationView } from './operatorStationView.ts';
import { riderStationView } from './riderStationView.ts';

/** La gare : 4 bornes, 3 vélos à quai dont b2 en panne, 1 borne libre. */
const GARE = () => Station.of({ id: 'gare', docks: 4, bikes: ['b1', 'b2', 'b3'], brokenBikes: ['b2'] });

//DEMANDE 11
test('l\'usager reçoit les vélos disponibles et les places libres, et rien d\'autre', () => {
    assert.deepEqual(riderStationView(GARE()), { stationId: 'gare', availableBikes: 2, freeDocks: 1 });
});

test('les vélos en panne et l\'état des bornes ne sont jamais envoyés à l\'usager, même cachés', () => {
    const sent = JSON.stringify(riderStationView(GARE()));

    assert.equal(sent.includes('b2'), false);
    assert.equal(sent.includes('broken'), false);
    assert.equal(sent.includes('dock"'), false);
    assert.deepEqual(Object.keys(riderStationView(GARE())).sort(), ['availableBikes', 'freeDocks', 'stationId']);
});

test('l\'exploitant reçoit l\'état de chaque borne et les vélos en panne', () => {
    assert.deepEqual(operatorStationView(GARE()), {
        stationId: 'gare',
        docks: [
            { dock: 1, state: 'available', bikeId: 'b1' },
            { dock: 2, state: 'broken', bikeId: 'b2' },
            { dock: 3, state: 'available', bikeId: 'b3' },
            { dock: 4, state: 'free' },
        ],
        brokenBikes: ['b2'],
    });
});

test('ajouter une information pour l\'exploitant ne change pas ce que reçoit l\'usager', () => {
    // Deux vues, deux types, deux fonctions : la vue de l'exploitant peut grandir, celle de l'usager garde sa forme.
    const operatorFields = Object.keys(operatorStationView(GARE()));
    const riderFields = Object.keys(riderStationView(GARE()));

    assert.ok(operatorFields.includes('brokenBikes'));
    assert.deepEqual(riderFields.sort(), ['availableBikes', 'freeDocks', 'stationId']);
});

test('une station vide et une station pleine se lisent sans erreur', () => {
    assert.deepEqual(riderStationView(Station.of({ id: 'mairie', docks: 2 })), { stationId: 'mairie', availableBikes: 0, freeDocks: 2 });
    assert.deepEqual(riderStationView(Station.of({ id: 'port', docks: 2, bikes: ['b1', 'b2'] })), { stationId: 'port', availableBikes: 2, freeDocks: 0 });
});
