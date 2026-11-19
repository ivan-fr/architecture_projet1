import test from 'node:test';
import assert from 'node:assert/strict';

import { aStation } from '../../testing/builders.ts';
import { riderStationView } from './riderStationView.ts';

/**
 * L'appli (riderStationView) et la borne (Station.returnBike) lisent la même station et la même règle,
 * Station.freeDocks : elles ne peuvent pas se contredire. Ces tests les confrontent sur la même station.
 */

//DEMANDE 18
test('20 vélos pour 20 bornes : l\'appli annonce la station pleine, et la borne refuse le vélo', () => {
    const station = aStation().withDocks(20).full().build();

    assert.equal(riderStationView(station).freeDocks, 0);
    assert.throws(() => station.returnBike('x99'), /full/);
});

test('19 vélos : une place libre dans l\'appli, et la borne accepte', () => {
    const station = aStation().withDocks(20).withBikes(19).build();

    assert.equal(riderStationView(station).freeDocks, 1);
    station.returnBike('x99');
    assert.equal(riderStationView(station).freeDocks, 0);
});

test('une station passe à 25 bornes : un seul changement, et l\'appli comme la borne suivent', () => {
    // La seule différence avec les tests à 20 bornes : withDocks(25). Le nombre de bornes est une donnée, pas une constante.
    const station = aStation().withDocks(25).withBikes(24).build();

    assert.equal(riderStationView(station).freeDocks, 1);
    station.returnBike('x99');
    assert.equal(riderStationView(station).freeDocks, 0);
    assert.throws(() => station.returnBike('x100'), /full/);
});
