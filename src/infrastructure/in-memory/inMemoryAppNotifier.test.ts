import test from 'node:test';
import assert from 'node:assert/strict';
import { inMemoryAppNotifier } from './inMemoryAppNotifier.ts';

test('la collecte copie la notification écrite et les notifications relues', async () => {
    const app = inMemoryAppNotifier();
    const notification = { userId: 'u1', stationId: 'gare', type: 'StationEmpty' as const };
    await app.send(notification);
    notification.userId = 'changed before read';
    app.notifications[0]!.userId = 'changed after read';
    assert.deepEqual(app.notifications, [{ userId: 'u1', stationId: 'gare', type: 'StationEmpty' }]);
});
