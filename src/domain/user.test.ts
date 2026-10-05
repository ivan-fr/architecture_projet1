import test from 'node:test';
import assert from 'node:assert/strict';

import { userOf } from './user.ts';

//DEMANDE 07
test('un usager valide est construit tel quel', () => {
    assert.deepEqual(userOf({ id: 'u1', name: 'Lina', riderType: 'subscriber' }), { id: 'u1', name: 'Lina', riderType: 'subscriber' });
});

test('un usager sans nom est refusé', () => {
    assert.throws(() => userOf({ id: 'u1', name: '   ', riderType: 'subscriber' }), /name/);
});

test('un usager sans identifiant est refusé', () => {
    assert.throws(() => userOf({ id: '', name: 'Lina', riderType: 'subscriber' }), /id/);
});

test('un type d\'usager inconnu est refusé', () => {
    assert.throws(() => userOf({ id: 'u1', name: 'Lina', riderType: 'vip' }), /rider type/);
});
