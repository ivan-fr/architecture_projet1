import test from 'node:test';
import assert from 'node:assert/strict';

import { Money } from './money.ts';

test('un montant en euros et le même en centimes sont égaux', () => {
    assert.ok(Money.euros(1.2).equals(Money.cents(120)));
});

test('trois demi-heures à 1,20 € font 3,60 €, sans erreur de virgule', () => {
    assert.ok(Money.euros(1.2).times(3).equals(Money.euros(3.6)));
});

test('les montants s\'additionnent', () => {
    assert.ok(Money.euros(1).plus(Money.euros(2.6)).equals(Money.euros(3.6)));
});

test('un montant s\'affiche comme un prix', () => {
    assert.equal(Money.euros(1).toString(), '1,00 €');
    assert.equal(Money.euros(3.6).toString(), '3,60 €');
});

test('un montant négatif est refusé', () => {
    assert.throws(() => Money.cents(-1), /negative/);
});

test('un montant plus fin que le centime est refusé', () => {
    assert.throws(() => Money.euros(0.001), /cent/);
});
