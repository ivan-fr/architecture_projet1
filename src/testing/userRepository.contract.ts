import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import type { User } from '../domain/user.ts';
import type { UserRepository } from '../domain/ports/userRepository.ts';

const LINA: User = { id: 'u1', name: 'Lina', riderType: 'subscriber' };

/**
 * Le contrat du port `UserRepository`, écrit une fois, joué par chaque implémentation.
 * Un cas d'usage ne doit pas pouvoir deviner s'il a reçu le fichier ou la mémoire.
 */
export function userRepositoryContract(name: string, make: () => Promise<UserRepository>): void {
    describe(`${name} respecte le contrat UserRepository`, () => {
        test('un usager inconnu donne undefined, pas une erreur', async () => {
            const users = await make();

            assert.equal(await users.byId('inconnu'), undefined);
        });

        test('un usager enregistré est retrouvé', async () => {
            const users = await make();

            await users.add(LINA);

            assert.deepEqual(await users.byId('u1'), LINA);
        });

        test('enregistrer un usager déjà connu le remplace', async () => {
            const users = await make();

            await users.add(LINA);
            await users.add({ ...LINA, riderType: 'non-subscriber' });

            assert.equal((await users.byId('u1'))?.riderType, 'non-subscriber');
        });
    });
}
