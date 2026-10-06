import test from 'node:test';
import assert from 'node:assert/strict';

import { aStation, aUser } from './builders.ts';

//DEMANDE 17
test('un usager par défaut est valide, sans rien préciser', () => {
    const lina = aUser().build();

    assert.equal(lina.name, 'Lina');
    assert.equal(lina.email, 'lina@beaulieu.fr');
    assert.equal(lina.riderType, 'subscriber');
});

test('un usager ne dit que ce qui compte pour le test', () => {
    const theo = aUser().withId('u2').named('Théo').nonSubscriber().build();

    assert.equal(theo.id, 'u2');
    assert.equal(theo.email, 'theo@beaulieu.fr');
    assert.equal(theo.riderType, 'non-subscriber');
});

test('un usager invalide passe toujours par la règle : il est refusé', () => {
    assert.throws(() => aUser().named('   ').build(), /name/);
});

test('une station pleine a autant de vélos que de bornes, quel que soit ce nombre', () => {
    assert.equal(aStation().withDocks(25).full().build().freeDocks, 0);
});
