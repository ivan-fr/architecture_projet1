import test from 'node:test';
import assert from 'node:assert/strict';

import { Station } from './station.ts';

/** Des vélos numérotés b1, b2, … */
const bikes = (count: number) => Array.from({ length: count }, (_, index) => `b${index + 1}`);

//DEMANDE 09
test('une station a 20 bornes : le 21e vélo est refusé, et la station ne change pas', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: bikes(20) });

    assert.throws(() => station.returnBike('b21'), /full/);
    assert.equal(station.freeDocks, 0);
    assert.deepEqual(station.bikes, bikes(20));
});

test('on ne prend pas de vélo dans une station vide', () => {
    const station = Station.of({ id: 'gare', docks: 20 });

    assert.throws(() => station.takeBike(), /empty/);
    assert.equal(station.freeDocks, 20);
});

test('un vélo rendu occupe une borne', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: bikes(5) });

    station.returnBike('b6');

    assert.equal(station.freeDocks, 14);
    assert.ok(station.bikes.includes('b6'));
});

test('un vélo pris libère une borne, et il n\'est plus dans la station', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: bikes(5) });

    const taken = station.takeBike();

    assert.equal(station.freeDocks, 16);
    assert.ok(!station.bikes.includes(taken));
});

//LIMITES DEMANDE 09
test('le dernier vélo peut être pris, la dernière borne peut être occupée', () => {
    const station = Station.of({ id: 'gare', docks: 1, bikes: ['b1'] });

    station.takeBike();
    assert.equal(station.freeDocks, 1);
    station.returnBike('b1');
    assert.equal(station.freeDocks, 0);
});

test('un même vélo ne peut pas occuper deux bornes', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: ['b1'] });

    assert.throws(() => station.returnBike('b1'), /already/);
    assert.equal(station.freeDocks, 19);
});

test('personne ne range un vélo dans la station par-derrière', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: ['b1'] });

    (station.bikes as string[]).push('b2');

    assert.deepEqual(station.bikes, ['b1']);
    assert.equal(station.freeDocks, 19);
});

test('une station relue avec plus de vélos que de bornes est refusée', () => {
    assert.throws(() => Station.of({ id: 'gare', docks: 20, bikes: bikes(21) }), /full/);
});

test('une station sans borne, ou avec un nombre de bornes absurde, est refusée', () => {
    assert.throws(() => Station.of({ id: 'gare', docks: 0 }), /docks/);
    assert.throws(() => Station.of({ id: 'gare', docks: -3 }), /docks/);
    assert.throws(() => Station.of({ id: 'gare', docks: 2.5 }), /docks/);
});

test('une station sans identifiant est refusée', () => {
    assert.throws(() => Station.of({ id: ' ', docks: 20 }), /id/);
});

//DEMANDE 11 : la station sait quels vélos sont en panne
test('les vélos disponibles sont ceux à quai qui ne sont pas en panne', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: bikes(5), brokenBikes: ['b2', 'b4'] });

    assert.equal(station.availableBikes, 3);
    assert.deepEqual(station.brokenBikes, ['b2', 'b4']);
});

test('on ne prend jamais un vélo en panne', () => {
    const station = Station.of({ id: 'gare', docks: 20, bikes: ['b1', 'b2'], brokenBikes: ['b1'] });

    assert.equal(station.takeBike(), 'b2');
    assert.throws(() => station.takeBike(), /empty/);
    assert.deepEqual(station.bikes, ['b1']);
});

test('un vélo en panne qui n\'est pas à quai est une donnée absurde, refusée', () => {
    assert.throws(() => Station.of({ id: 'gare', docks: 20, bikes: ['b1'], brokenBikes: ['b9'] }), /not docked/);
});
