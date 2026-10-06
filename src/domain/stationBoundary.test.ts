import test from 'node:test';
import assert from 'node:assert/strict';
import { Station } from './station.ts';
import { stationBoundary } from './stationBoundary.ts';

const at = (bikes: string[], docks = 2) => Station.of({ id: 'gare', docks, bikes });

test('le dernier vélo pris produit le fait StationEmpty', () => {
    assert.deepEqual(stationBoundary(at(['b1']), at([])), [{ type: 'StationEmpty', stationId: 'gare' }]);
});

test('la dernière borne occupée produit le fait StationFull', () => {
    assert.deepEqual(stationBoundary(at(['b1']), at(['b1', 'b2'])), [{ type: 'StationFull', stationId: 'gare' }]);
});

test('une station intermédiaire ou inchangée ne produit aucun événement', () => {
    assert.deepEqual(stationBoundary(at(['b1', 'b2'], 3), at(['b1'], 3)), []);
    assert.deepEqual(stationBoundary(at([]), at([])), []);
    assert.deepEqual(stationBoundary(at(['b1', 'b2']), at(['b1', 'b2'])), []);
});

test('un vélo en panne reste à quai : la station ne devient pas vide', () => {
    const before = Station.of({ id: 'gare', docks: 2, bikes: ['b1', 'b2'], brokenBikes: ['b1'] });
    const after = Station.of({ id: 'gare', docks: 2, bikes: ['b1'], brokenBikes: ['b1'] });
    assert.deepEqual(stationBoundary(before, after), []);
});
