import test from 'node:test';
import assert from 'node:assert/strict';
import { Station } from './station.ts';
import { stationBoundary } from './stationBoundary.ts';
import { inMemoryBikeMovementRepository } from '../infrastructure/in-memory/inMemoryBikeMovementRepository.ts';
import { inMemoryUserRepository } from '../infrastructure/in-memory/inMemoryUserRepository.ts';
import { userOf } from './user.ts';
import { TakeBikeHandler } from '../application/use-cases/take-bike/takeBike.handler.ts';
import { inMemoryEventBus } from '../infrastructure/in-memory/inMemoryEventBus.ts';

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

test('il ne reste que des vélos en panne : plus rien à prendre, la station est annoncée vide', () => {
    const before = Station.of({ id: 'gare', docks: 2, bikes: ['b1', 'b2'], brokenBikes: ['b1'] });
    const after = Station.of({ id: 'gare', docks: 2, bikes: ['b1'], brokenBikes: ['b1'] });
    assert.deepEqual(stationBoundary(before, after), [{ type: 'StationEmpty', stationId: 'gare' }]);
});

test('une station sans vélo disponible au départ ne redevient pas vide', () => {
    const before = Station.of({ id: 'gare', docks: 3, bikes: ['b1'], brokenBikes: ['b1'] });
    const after = Station.of({ id: 'gare', docks: 3, bikes: ['b1'], brokenBikes: ['b1'] });
    assert.deepEqual(stationBoundary(before, after), []);
});

test('19/20 : un vélo pris ne déclenche pas StationFull', () => {
    const before = Station.of({ id: 'gare', docks: 20, bikes: Array.from({ length: 19 }, (_, i) => `b${i + 1}`) });
    const after = Station.of({ id: 'gare', docks: 20, bikes: Array.from({ length: 18 }, (_, i) => `b${i + 1}`) });
    assert.deepEqual(stationBoundary(before, after), []);
});

test('si la station passe à 25 bornes, le calcul reste dynamique : un seul changement suffit', () => {
    const before = Station.of({ id: 'gare', docks: 25, bikes: Array.from({ length: 24 }, (_, i) => `b${i + 1}`) });
    const after = Station.of({ id: 'gare', docks: 25, bikes: Array.from({ length: 25 }, (_, i) => `b${i + 1}`) });

    assert.deepEqual(stationBoundary(before, after), [{ type: 'StationFull', stationId: 'gare' }]);
});
