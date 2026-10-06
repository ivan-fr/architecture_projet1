import test from 'node:test';
import assert from 'node:assert/strict';
import { inMemoryEventBus } from './inMemoryEventBus.ts';

const EMPTY = { type: 'StationEmpty', stationId: 'gare' } as const;

test('un auditeur en échec ne bloque pas le suivant', async () => {
    const events = inMemoryEventBus();
    const seen: string[] = [];
    events.subscribe(async () => { throw new Error('first channel offline'); });
    events.subscribe(async (event) => { seen.push(event.stationId); });
    await events.publish(EMPTY);
    assert.deepEqual(seen, ['gare']);
    assert.equal(events.failures.length, 1);
});

test('un auditeur reçoit sa copie et peut se désabonner', async () => {
    const events = inMemoryEventBus();
    const seen: string[] = [];
    const unsubscribe = events.subscribe(async (event) => { event.stationId = 'modified'; });
    events.subscribe(async (event) => { seen.push(event.stationId); });
    await events.publish(EMPTY);
    unsubscribe();
    await events.publish(EMPTY);
    assert.deepEqual(seen, ['gare', 'gare']);
});
