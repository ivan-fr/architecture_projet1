import test from 'node:test';
import assert from 'node:assert/strict';

import type { Letter } from '../../../domain/ports/mailer.ts';
import { inMemoryUserRepository } from '../../../infrastructure/in-memory/inMemoryUserRepository.ts';
import { RegisterUserHandler } from './registerUser.handler.ts';

import { aUser } from '../../../testing/builders.ts';

const LINA = aUser().nonSubscriber().raw();

/** Un faux facteur : il note les lettres au lieu de les envoyer. Aucun vrai mail ne part. */
function service() {
    const users = inMemoryUserRepository();
    const sent: Letter[] = [];
    const mailer = {
        async send(letter: Letter) {
            sent.push(letter);
        },
    };
    return { handler: new RegisterUserHandler({ users, mailer }), users, sent };
}

//DEMANDE 08
test('un usager inscrit est retrouvé ensuite', async () => {
    const { handler, users } = service();

    await handler.handle(LINA);

    assert.equal((await users.byId('u1'))?.email, 'lina@beaulieu.fr');
});

test('une adresse mail mal formée est refusée, rien n\'est enregistré et aucun mail ne part', async () => {
    const { handler, users, sent } = service();

    await assert.rejects(() => handler.handle({ ...LINA, email: 'lina.beaulieu.fr' }), /email/);
    assert.equal(await users.byId('u1'), undefined);
    assert.deepEqual(sent, []);
});

test('un mail de bienvenue part à son adresse', async () => {
    const { handler, sent } = service();

    await handler.handle(LINA);

    assert.equal(sent.length, 1);
    assert.equal(sent[0]?.to, 'lina@beaulieu.fr');
    assert.ok(sent[0]?.body.includes('Lina'));
});

test('s\'inscrire une seconde fois est refusé, et le mail de bienvenue ne repart pas', async () => {
    const { handler, sent } = service();
    await handler.handle(LINA);

    await assert.rejects(() => handler.handle(LINA), /already registered/);
    assert.equal(sent.length, 1);
});
